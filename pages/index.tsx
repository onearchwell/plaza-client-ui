"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ErrorBoundary } from "../components/ErrorBoundary"
import {
  Stack,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  TextField,
  IStackTokens,
  IStackStyles,
  Spinner,
  SpinnerSize,
  Icon,
  IconButton,
  IBreadcrumbItem,
  Breadcrumb,
  TooltipHost,
  DirectionalHint,
  Tooltip,
} from "@fluentui/react"
import { Tree, TreeItem, TreeItemLayout } from "@fluentui/react-components";
import { IIconProps } from '@fluentui/react/lib/Icon';
import { Footer } from "../components/Footer"
import { initializeIcons } from "@fluentui/font-icons-mdl2"
import * as CryptoJS from 'crypto-js';

import styles from '../styles/component.module.scss'
import DocumentViewer from "../components/DocumentViewer"
import { useRouter } from "next/router"

initializeIcons()
const fontFamily: string = "Arial, sans-serif"
const stackTokens: IStackTokens = { childrenGap: 0 }
const stackfontStyles: IStackStyles = {
  root: {
    fontFamily: fontFamily,
  },
};

interface ITreeItem {
  key: string;
  uniqueId: string;
  name: string;
  children?: ITreeItem[];
  path: string;
  isfolder: boolean;
  iconProps?: IIconProps;
}

// Interface for document/folder items
interface IDocumentItem {
  id: string
  fileId?: string
  name: string
  title?: string
  isFolder?: boolean
  serverRelativeUrl?: string
  timeCreated?: string
  publishedOn?: string
  fileSize?: number
  publishedBy?: string
  modifiedByEmail?: string
  children?: IDocumentItem[]
  version?: string
  docVersion?: string
  status?: string
  iconName?: string
  description?: string
  notification_group?: string
  type?: "file" | "folder"
  created_by?: string
  publisher?: string
  size?: string;
  owner?: string,
  approvers?: string,
  nextReview?: string,
  permissions?: string[],
  rawdata?: any,
}

const App: React.FC = () => {
  const router = useRouter();

  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState<boolean>(false)
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [documents, setDocuments] = useState<IDocumentItem[]>([])
  const [searchText, setSearchText] = useState<string>("")
  const [enableSearch, seteEableSearch] = useState<boolean>(false)
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<ITreeItem[]>([])
  const [treeitems, setTreeitems] = useState<ITreeItem[]>([])
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<IDocumentItem | null>(null)
  const [currentPath, setCurrentPath] = useState<string>("")
  const [breadcrumbItems, setBreadcrumbItems] = useState<IBreadcrumbItem[]>([])
  const [firstLevelKeys, setFirstLevelKeys] = useState<Set<string>>(new Set());
  const [landingPageId, setLandingPageId] = useState<string | null>("259");

  const fetchItems = async () => {
    try {
      const endpoint = "/api/sharepoint/root"

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      if (!response.body) {
        throw new Error("Response body is empty");
      }
      const data = await response.json();
      return data
    } catch (err) {
      console.error("Error fetching items:", err)
      setError("Failed to fetch items. Please try again later.")
    }
  };

  const updateBreadcrumbItems = (inputUrl: string, title: string) => {
    // console.log("inputUrl -----------",inputUrl)
    // console.log("title -----------",title)
    let parts: any[] = []
    if (inputUrl !== process.env.NEXT_PUBLIC_PREURL) 
      parts = inputUrl ? inputUrl.split("/").filter((p) => p) : [];
    // Take only the last 2 index
    const filteredParts = parts.slice(-2);
    const startIndex = parts.length - filteredParts.length;
    const seenPaths = new Set<string>();
    seenPaths.add("sites/ResourceCenter/" + process.env.NEXT_PUBLIC_DOCUMENT_LIBRARY_NAME);
    const breadcrumbs: IBreadcrumbItem[] = [
      // {
      //   key: "sites/ResourceCenter/" + props.documentLibraryName,
      //   text: props.documentLibraryName,
      //   ...(isAdmin && { onClick: () => loadLiveDocuments("/sites/ResourceCenter/" + props.documentLibraryName) }),
      // },
      ...filteredParts.map((part, index) => {
        const path = parts.slice(0, startIndex + index + 1).join("/");
        if (index == 1) {
          if (path.includes('.')) { //It is a file
            part = title? title : part
          }
        }
        return {
          key: path,
          text: part,
          // ...(isAdmin && { onClick: () => loadLiveDocuments("/" + path) }),
        };
      })
      .filter((breadcrumb) => {
        if (seenPaths.has(breadcrumb.key)) return false;
        seenPaths.add(breadcrumb.key);
        return true;
      })
    ];

    setBreadcrumbItems(breadcrumbs);
    console.log("Breadcrumb updated:", breadcrumbs);    
  }

  const generateNumericId = () => {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  };

  const buildTree = (items: any[]): ITreeItem[] => {
    const root: ITreeItem = { key: "root", name: "root", uniqueId: "", children: [], path: "/", isfolder: true};
    
    items.forEach(item => {
      const parts = item.FileRef.split("/").filter((p: any) => p).slice(2);
        let currentLevel = root.children!; // Start at root level
        let path = ""
        
        parts.forEach((part: string, index: number) => {
            const existingNode = currentLevel.find(node => node.name === part);
            path = path + "/" + part
            if (existingNode) {
                currentLevel = existingNode.children!;
            } else {
                const title = item.Title? item.Title : item.FileLeafRef
                const newNode: ITreeItem = {
                    key: index === parts.length - 1 ? item.Id.toString() : generateNumericId(),
                    name: index === parts.length - 1 ? title : part,
                    uniqueId: index === parts.length - 1 ? item.UniqueId : "",
                    path: index === parts.length - 1 ? item.FileRef : path,
                    children: index === parts.length - 1 ? undefined : [],
                    isfolder: index === parts.length - 1 ? false : true,
                    iconProps: index === parts.length - 1 ? {iconName: 'Page'} : {iconName: 'Folder'},
                };

                if(landingPageId) {
                  console.log("In landingPageId :", landingPageId)
                  if(item.ID == landingPageId) {
                      const url = "https://plazahomemortgage.sharepoint.com/sites/DocumentManagerDev/_layouts/15/Embed.aspx?UniqueId="+newNode.uniqueId
                      const listItem: IDocumentItem = {
                      id: newNode.key,
                      name: newNode.name,
                      isFolder: newNode.isfolder,
                      serverRelativeUrl: url
                    }
                    setSelectedItem(listItem)
                    setSelectedKey(newNode.key)
                    updateBreadcrumbItems(newNode.path, newNode.name)
                    setLandingPageId(null)
                  }
                }
                currentLevel.push(newNode);
                if (newNode.children) {
                    currentLevel = newNode.children;
                }
            }
        });
    });
    return root.children!;
  };

  const getAllFiles = async (): Promise<ITreeItem[]> => {
    let treeViewItems: ITreeItem[] = []
    const data = await fetchItems()
    return data
  };

  // Load TreeView from SharePoint
  const loadTreeView = async () => {
    console.log("Loading Tree View data")
    const data = await getAllFiles()
    console.log(data)
    const treeData = buildTree(data);
    console.log(treeData)
    setTreeitems(treeData)
    const firstLevelKeys = new Set(treeData.map(item => item.key));
    console.log(firstLevelKeys)
    setFirstLevelKeys(firstLevelKeys)
  };  

  const checkMe = (user: string): boolean =>  {
    const allowedPermissions = ["ResCtrUser", "ResCtrWHL", "ResCtrMC", "ResCtrRev", "RecCtrMC"];
    // const key = "encryptme"
    // const encryptedMessage = CryptoJS.SHA256(user).toString(CryptoJS.enc.Hex);
    // console.log('Encrypted Message:', encryptedMessage);
    // const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
    // const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
    // console.log('Decrypted Message:', decryptedMessage);
    return allowedPermissions.includes(user)
  }

  useEffect(() => {

    // Check if it is a redirect page
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);   
    // const val = localStorage.getItem('me');
    const val = params.has("me")? params.get("me"): ""
    console.log(val)
    if (!val || !checkMe(val)) {
      router.push("/unauthorized");
      return;
    }
    loadTreeView()
 
    if (params.has("fileId") && params.get("fileId")) {
      const idValue = params.get("fileId");
      console.log("Extracted fileId:", idValue);
      setLandingPageId(idValue)
      console.log("Landing page id is :",landingPageId)
    }
    setLoading(false)
  }, [loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  async function handleSearch () {
    setSearchLoading(true)
    // DEEPTHI
    // const items = await searchLibraryItemsCont(searchText);
    // console.log("****** Search Returns****",items)
    // setSearchResults(items)
    // setSearchLoading(false)
  };

  // Render file details view
  const renderFileDetails = () => {
    if (!selectedItem || selectedItem.isFolder) return null

    console.log("Rendering file : ", selectedItem)

    return (
      <Stack className={styles.fileDetails}>
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: "start",
            overflow: 'auto',
            marginBottom: '10px',
            fontFamily: fontFamily,
          }}
        >
          <DocumentViewer fileUrl={selectedItem.serverRelativeUrl} />
        </Stack>
      </Stack>
    )
  }
  

  const openInNewTab = () => {
    if (selectedItem)
      window.open(selectedItem.serverRelativeUrl, "_blank");
  };

  async function onTreeItemExpandCollapse(item: ITreeItem, isExpanded: boolean) {

  }

  async function handleItemSelect(item: ITreeItem): Promise<void> {
    console.log("Items selected: ", item);
    updateBreadcrumbItems(item.path, item.name)
    if(item) {
        if(item.isfolder) {
          onTreeItemExpandCollapse(item, true);
          setSelectedKey(item.key) //Unique
        }
      if (isAdmin || !item.isfolder) {
        const url = "https://plazahomemortgage.sharepoint.com/sites/DocumentManagerDev/_layouts/15/Embed.aspx?UniqueId="+item.uniqueId
        const listItem: IDocumentItem = {
          id: item.key,
          name: item.name,
          isFolder: item.isfolder,
          serverRelativeUrl: url
        };
        setSelectedItem(listItem)
      }
    }
  }

  const renderTreeItems = (items: any[]) => {
    return items.map((item) => (
      <TreeItem className={styles.treeViewItem} key={item.key} itemType={item.isfolder? "branch" : "leaf"}
            value={item.name} onClick={() => handleItemSelect(item)} 
            style={{ marginLeft: item.children && item.children.length > 0 ? '20px' : '40px'}}
            iconProps={item.iconProps} > 
              {/* DEEPTHI <Tooltip content={`${rootFolder}${item.path.split(rootFolder)[1] || item.path}`}> */}
                <TreeItemLayout>{item.name}</TreeItemLayout>
              {/* </Tooltip> */}
              {item.children && item.children.length > 0 && (
          <Tree>{renderTreeItems(item.children)}</Tree>
        )}
      </TreeItem>
    ));
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="ms-Grid p-4">
          <div className="ms-depth-4 p-4 bg-red-50 text-red-800 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Component Error</h2>
            <p>An error occurred while loading the Document Tree View. Please try refreshing the page.</p>
            <button
              className="mt-4 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
              onClick={() => window.location.reload()}
            >
              Reload Web Part
            </button>
          </div>
        </div>
      }
    >

      <Stack className={styles.documentTreeView} styles={stackfontStyles}>
        <Stack tokens={stackTokens}>

          {/* Error message */}
          {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}

          {/* Main content */}
          {isLoading && !documents.length ? (
            <Stack
            verticalAlign="center"
            horizontalAlign="center"
            styles={{ root: { minHeight: 600 } }}
        >
            <Spinner size={SpinnerSize.large} label="Loading documents..." />
        </Stack>
          ) : (
            <Stack horizontal tokens={stackTokens} className={styles.contentContainer}>
              <Stack className={styles.treeViewContainer}>
                <TextField 
                  placeholder="Search..." 
                  value={searchText}
                  onKeyDown={(e)=>{
                    if (e.key === 'Enter') {
                      if(searchText)seteEableSearch(true)
                        else {seteEableSearch(false)}
                      handleSearch();
                    }
                  }}
                  onChange={(e:any) => {
                    console.log(e.target.value, 'e.target.value*****')
                    console.log(!e.target.value, 'e.target.value*****')
                    if(!e.target.value) seteEableSearch(false)
                    setSearchText(e.target.value)
                    if (e.key === 'Enter') {
                      if(e.target.value)seteEableSearch(true)
                        else {seteEableSearch(false)}
                      handleSearch();
                    }
                  }}
                  onRenderSuffix={() => (
                    <>
                            {searchText && (
                           <span
                           onClick={() => {
                             setSearchText(''); // Clear the search text
                             seteEableSearch(false); // Disable the search button if necessary
                           }}
                           style={{
                             cursor: 'pointer',
                             display: 'inline-block',
                             padding: '0 5px', // Spacing around the icon
                           }}
                           aria-label="Clear"
                         >
                           <Icon iconName="Clear" style={{ fontSize: '16px', color: '#888' }} />
                         </span>
                          )}
                      <IconButton
                        iconProps={{ iconName: 'Send' }}
                        onClick={(e: any) => {
                          if (searchText) seteEableSearch(true)
                          else { seteEableSearch(false)} 
                          handleSearch()
                        } }
                        title="Send"
                        ariaLabel="Send"
                        styles={{ root: { height: '32px', width: '32px' } }} />
                        </>

                  )}
                />
                <Stack className={styles.treeView}>
                {!enableSearch ?
                  <Tree aria-label="Dropdown Tree">
                    {renderTreeItems(treeitems)}
                  </Tree>
                : searchLoading?  
                <Stack
                verticalAlign="center"
                horizontalAlign="center"
                styles={{ root: { minHeight: 400 } }}
                >
                <Spinner size={SpinnerSize.large} label="Loading documents..." />
            </Stack>:
                // <TreeView
                // items={searchResults}
                // defaultExpanded={false}
                // selectionMode={TreeViewSelectionMode.Single}
                // selectChildrenMode={SelectChildrenMode.Select | SelectChildrenMode.Unselect}
                // showCheckboxes={false}
                // treeItemActionsDisplayMode={TreeItemActionsDisplayMode.ContextualMenu}
                // defaultSelectedKeys={selectedKey ? [selectedKey] : []}
                // expandToSelected={true}
                // defaultExpandedChildren={false}
                // // onSelect={onTreeItemSelect}
                // onExpandCollapse={onTreeItemExpandCollapse}
                // onRenderItem={(item) => {

                //   const rootFolder = "Plaza Resource Center";
                //   const relativePath = item.data.url.includes(rootFolder)
                //     ? item.data.url.split(rootFolder)[1] // Get the part after "Plaza Resource Center"
                //     : item.data.url; // Fallback to the full path if "Plaza Resource Center" is not found

                //   return <TooltipHost
                //   content={`${rootFolder}${relativePath}`} // Display the adjusted path
                //   calloutProps={{
                //     directionalHint: DirectionalHint.bottomLeftEdge, // Position the tooltip to the right
                //   }}
                // >
                //   <div
                //     className={styles.treeViewItem}
                //     onClick={() => handleItemSelect(item)}
                //   >
                //     {item.label}
                //   </div>
                // </TooltipHost>
                // }}
                // />
                undefined
                }

                {enableSearch && !searchResults.length && <Stack
                verticalAlign="center"
                horizontalAlign="center"
                styles={{ root: { minHeight: 400 } }}
            >
                No Results
            </Stack>}
                </Stack>
              </Stack>

              {/* Document list or file details */}
             <div className={styles.documentListContainer}>
                <div className={styles.breadcrumbContainer} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Breadcrumb items={breadcrumbItems} maxDisplayedItems={5} className={styles.breadcrumb} styles={{ list: { flexWrap: 'nowrap' } }} />

                  {selectedItem && !selectedItem.isFolder?
                  <PrimaryButton onClick={openInNewTab}
                    iconProps={{ iconName: 'Download' }} 
                    styles={{
                      root: {
                        backgroundColor: 'white',
                        borderColor: '#970067',
                        color: '#970067',
                        borderRadius: '5px',
                        minHeight: '30px',
                        minWidth: '30px',
                        padding: '1px 1px'
                      },
                      rootHovered: {
                        backgroundColor: '#7a0053',
                        borderColor: '#7a0053'
                      },
                      rootPressed: {
                        borderColor: '#5e003f'
                      }
                    }}
                  >
                  </PrimaryButton>
                : undefined
              }
              </div>

                {/* Content */}
                <div className={styles.contentArea}>
                  {selectedItem && !selectedItem.isFolder
                    ? renderFileDetails()
                    : undefined
                  }
                </div>
              </div>
            </Stack>
          )}
        </Stack>
       
        <Footer fileId={selectedItem?.fileId} currentPath={selectedItem?.serverRelativeUrl || 'Plaza Resource Center'} onFeedbackClick={() => { setIsFeedbackFormOpen(!isFeedbackFormOpen) }} />
      </Stack>
       {/* {JSON.stringify(selectedItem)} */}
    </ErrorBoundary>
  )
}


export default App

