"use client"

import React from "react"
import { useState, useEffect } from "react"
import { ErrorBoundary } from "../components/ErrorBoundary"
import Cookies from "js-cookie";
import {
  Stack,
  MessageBar,
  MessageBarType,
  TextField,
  IStackTokens,
  IStackStyles,
  Spinner,
  SpinnerSize,
  Icon,
  IconButton,
  IBreadcrumbItem,
  TooltipHost,
  DirectionalHint,
} from "@fluentui/react"
import { Tree, TreeItem, TreeItemLayout } from "@fluentui/react-components";
import { IIconProps } from '@fluentui/react/lib/Icon';
import { Footer } from "../components/Footer"
import { initializeIcons } from "@fluentui/font-icons-mdl2"

import styles from '../styles/component.module.scss'
import DocumentViewer from "../components/DocumentViewer"
import { useRouter } from "next/router"
import Header from "../components/Header"
import CustomBreadcrumb from "../components/CustomBreadcrumb";
import Chatbot from "../components/chatbot/Chatbot";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../components/resizable"

initializeIcons()
const fontFamily: string = "Arial, sans-serif"
const stackTokens: IStackTokens = { childrenGap: 0 }
const stackfontStyles: IStackStyles = {
  root: {
    fontFamily: fontFamily,
  },
};

// Dev Server
const UserPermissionGroupDev = [
  {"group":"ResCtrUser", "landingPage": process.env.NEXT_PUBLIC_PREURL+ "/Welcome to Plaza_Associates.pdf",  "landingPageId": "259"},
  {"group":"ResCtrMC", "landingPage":process.env.NEXT_PUBLIC_PREURL+ "/Forms - Matrices - Checklists/Landing Page Forms Matrices Checklists - Mini-Correspondent.pdf", "landingPageId": "39"},
  {"group":"ResCtrWHL", "landingPage":process.env.NEXT_PUBLIC_PREURL+ "/Forms - Matrices - Checklists/Landing Page Forms, Matrices and Checklists - Wholesale.pdf","landingPageId": "36"},
  {"group":"ResCtrCOR", "landingPage":process.env.NEXT_PUBLIC_PREURL+ "/Communications/Landing Page Communications External_Correspondent.pdf", "landingPageId": "38"},
  {"group":"ResCtrRev", "landingPage":process.env.NEXT_PUBLIC_PREURL+ "/Reverse/Landing Page Reverse - Reverse.pdf", "landingPageId": "34"},

]

//Prod Server
const UserPermissionGroupProd = [
  {"group":"ResCtrUser", "landingPage": process.env.NEXT_PUBLIC_PREURL+ "/Welcome to Plaza_Associates.pdf",  "landingPageId": "2321"},
  {"group":"ResCtrMC", "landingPage":process.env.NEXT_PUBLIC_PREURL+ "/Welcome to Plaza_MiniCorr.pdf", "landingPageId": "2319"},
  {"group":"ResCtrWHL", "landingPage":process.env.NEXT_PUBLIC_PREURL+ "/Welcome to Plaza_Wholesale.pdf","landingPageId": "2378"},
  {"group":"ResCtrCOR", "landingPage":process.env.NEXT_PUBLIC_PREURL+ "/Welcome to Plaza_NatCOR.pdf", "landingPageId": "2304"},
  {"group":"ResCtrRev", "landingPage":process.env.NEXT_PUBLIC_PREURL+ "/Welcome to Plaza_Reverse.pdf", "landingPageId": "2293"},
 ]

interface ITreeItem {
  key: string;
  uniqueId: string;
  name: string;
  fileId: number,
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
  item?:any
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
  const [treeitems, setTreeItems] = useState<ITreeItem[]>([])
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<IDocumentItem | null>(null)
  const [currentPath, setCurrentPath] = useState<string>("")
  const [breadcrumbItems, setBreadcrumbItems] = useState<IBreadcrumbItem[]>([])
  const [landingPageId, setLandingPageId] = useState<string | null>("");
  const [landingPageFolder, setLandingPageFolder] = useState<string | null>("");
  const [group, setGroup] = useState<string | null>("");
  const [loadedChildren, setLoadedChildren] = useState([]);
  const [loadingMap, setLoadingMap] = useState<{ [key: string]: boolean }>({});
  const[initialLoadDone, setInitialLoadDone] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false)
  const[chatbotVisibility, setChatbotVisibility] = useState(false)
  const [openKeys, setOpenKeys] = useState(new Set(['Plaza Resource Center']));

  const fetchItems = async (folderPath) => {
    try {

      const response = await fetch('/api/sharepoint/root', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: folderPath,
          group: group
        })
      });
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
    return []
  };

  const updateBreadcrumbItems = (inputUrl: string, title: string) => {
    let parts: any[] = []
    if (inputUrl !== process.env.NEXT_PUBLIC_PREURL) 
      parts = inputUrl ? inputUrl.split("/").filter((p) => p) : [];
    // Take only the last 2 index
    const filteredParts = parts.slice(-2);
    const startIndex = parts.length - filteredParts.length;
    const seenPaths = new Set<string>();
    seenPaths.add(process.env.NEXT_PUBLIC_PREURL);
    const breadcrumbs: IBreadcrumbItem[] = [
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
        };
      })
      .filter((breadcrumb) => {
        if (seenPaths.has(breadcrumb.key)) return false;
        seenPaths.add(breadcrumb.key);
        return true;
      })
    ];

    setBreadcrumbItems(breadcrumbs);
    // console.log("Breadcrumb updated:", breadcrumbs);    
  }

  const buildChildTree = async (folderPath: string, group: string): Promise<ITreeItem[]> => {

    let currentLevel: ITreeItem[] = []

    const items = await fetchItems(folderPath)
    // console.log(items)
    items.forEach(async item => {
      // if (item.ItemCount > 0) {  
      if(group == "ResCtrUser" || item.Permissions?.results?.includes(group)) {   
        const title = item.Title? item.Title : item.FileLeafRef
        const newNode: ITreeItem = {
            key: item.UniqueId,
            name: title,
            fileId: item.Id.toString(),
            uniqueId: item.UniqueId,
            path: item.FileRef,
            children: item.FSObjType == 1?  [] : undefined,
            isfolder: item.FSObjType == 1,
            iconProps: item.FSObjType == 1? {iconName: 'Folder'} : {iconName: 'Page'},
        };

        if(newNode.isfolder && landingPageFolder) {
          const parts = landingPageFolder.split("/").filter(p => p);
          if(newNode.name == parts[0]) {
            currentLevel.push(newNode);
            let currentNodeArray = currentLevel;
            let currentPath = "";
            for (const part of parts) {
              currentPath += (currentPath ? "/" : "") + part;
              let existingNode = currentNodeArray.find(node => node.name === part);
              // Load children for the current node
              existingNode.children = await buildChildTree(existingNode.path, group);

              // Move deeper into the tree
              currentNodeArray = existingNode.children;
              onTreeItemExpandCollapse(existingNode)
            }
            setLandingPageFolder(null); 
          }
        }

        if(!newNode.isfolder && landingPageId) {
          if(item.ID == landingPageId) {
              const listItem: IDocumentItem = {
              id: newNode.key,
              fileId: newNode.fileId.toString(),
              name: newNode.name,
              isFolder: newNode.isfolder,
              serverRelativeUrl: newNode.path
            }
            setSelectedItem(listItem)
            setSelectedKey(newNode.key)
            updateBreadcrumbItems(newNode.path, newNode.name)
            setLandingPageId(null)
          }
        }
        currentLevel.push(newNode);
      }
    });
    return currentLevel;
  }

  const buildRootTree = async (folderPath: string, group: string): Promise<ITreeItem[]> => {
    const root: ITreeItem = { key: "root", name: "root", uniqueId: "", fileId:0, children: [], path: "/", isfolder: true};
    let currentLevel = root.children!;
    const parts = folderPath.split("/").filter((p: any) => p).slice(2);
    parts.forEach((part: string, index: number) => {
      const existingNode = currentLevel.find(node => node.name === part);
      if (existingNode)
        currentLevel = existingNode.children!;
      else {
        const newNode: ITreeItem = { key: "Plaza Resource Center", name: "Plaza Resource Center", uniqueId: "", fileId:0, children: [], path: process.env.NEXT_PUBLIC_PREURL, isfolder: true};
        currentLevel.push(newNode);
        // onTreeItemExpandCollapse(newNode)
        if (newNode.children) {
            currentLevel = newNode.children;
        }
      }
    })
    const result = await buildChildTree(folderPath, group)
    currentLevel.push(...result);
    return root.children!;
  };

  const handleLogout = () => {
    console.log("Logging out...")
    Cookies.remove("me", { path: "/" });
    router.push("/logout");
  }

  // Load TreeView from SharePoint
  const loadTreeView = async (group) => {
    const treeData = await buildRootTree(process.env.NEXT_PUBLIC_PREURL, group);
    setTreeItems(treeData)
    // console.log(treeData)
    // console.log("Loaded")
  }; 

  const loadFileItem = async (fileId, group) => {
    const response = await fetch('/api/sharepoint/fileById', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId: fileId,
        group: group
      })
    });
    if (!response.ok) {
      router.push("/error");
      return;
    }
    if (!response.body) {
      router.push("/error");
      return;
    }
    const data = await response.json();
    if (!data.Permissions.results.includes(group)) {
      router.push("/error");
      return;
    }
      
    const parts = data.FileRef ? data.FileRef.split("/").filter((p) => p) : [];
    if(!parts[parts.length-1].includes(".")) {
      router.push("/error");
      return;
    }
    const folderUrl = parts.slice(3, -1).join("/");
    setLandingPageFolder(folderUrl)
    setInitialLoadDone("Done")
    // console.log("Landing page id is :",landingPageId)
  }

  useEffect(() => {

    // Check if it is a redirect page
    const url = new URL(window.location.href);
    console.log(url)
    if (url.hostname === 'plaza-client-ui-prod-asgwa4g7c0abfyhz.eastus2-01.azurewebsites.net' || 
      url.hostname === 'resourcecenterprod.plazahomemortgage.com' 
    ) {
      url.hostname = `resourcecenter.plazahomemortgage.com`;
      url.host = `resourcecenter.plazahomemortgage.com`;
      window.location.href = url.toString(); 
    }
    
    const getCookieValue = (name: string) => {
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
      return match ? decodeURIComponent(match[2]) : null;
    };
  
    const group = getCookieValue("me");
    if (!group) {
      router.push("/unauthorized");
      return;
    }
    setGroup(group)

    if (process.env.NEXT_PUBLIC_CHATBOT_VISIBILITY == "ALL")
      setChatbotVisibility(true)
    else if(process.env.NEXT_PUBLIC_CHATBOT_VISIBILITY == "INTERNAL" && group == "ResCtrUser")
      setChatbotVisibility(true)

    const params = new URLSearchParams(url.search);   
    if (params.has("fileId") && params.get("fileId")) {
      const idValue = params.get("fileId");
      console.log("Extracted fileId:", idValue);
      setLandingPageId(idValue)
      loadFileItem(idValue, group)
    } else {
    
      let mapped_group = UserPermissionGroupDev.find(item => item.group === group);
      if (process.env.NEXT_PUBLIC_ENV == "Production")
        mapped_group = UserPermissionGroupProd.find(item => item.group === group);

      setLandingPageId(mapped_group.landingPageId)
      const parts = mapped_group.landingPage ? mapped_group.landingPage.split("/").filter((p) => p) : [];
      if(!parts[3].includes("."))
        setLandingPageFolder(parts[3])
      setInitialLoadDone("Done")
    }
  }, [loading, router])

  useEffect(() => {
    setLoading(false)
    loadTreeView(group)
  }, [loading, initialLoadDone])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  type SPKeyValue = {
    Key: string;
    Value: string | null;
    ValueType: string;
  };
  
  type SPResult = {
    Cells: {
      results: SPKeyValue[];
    };
  };

  const parseSearchRow = (row: SPResult) => {
    const item: Record<string, string | null> = row.Cells.results.reduce((acc, cell) => {
      acc[cell.Key] = cell.Value;
      return acc;
    }, {} as Record<string, string | null>);

    // Exclude folders and items with null FileType
    if (item["IsDocument"] == "false") {
      return null;
    }
    let path = item["OriginalPath"].split("sites")[1]
    path = "/sites" + path
    const uniqueId = item["UniqueId"].replace("{", "");

    return {
      key: uniqueId,
      name: item["Title"]? item["Title"] : item["Filename"],
      fileId: item["ListItemID"],
      uniqueId: uniqueId,
      path: path,
      children: undefined,
      isfolder: item["IsDocument"] == "false",
      iconProps: item["IsDocument"] == "true"? {iconName: 'Page'} : {iconName: 'Folder'},
    };
  };

  async function searchLibraryItemsCont(searchQuery: string): Promise<ITreeItem[]> {
    if (!searchQuery) return [];
  
    try {
      // Call Search API here
      const searchResults = await fetch('/api/sharepoint/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          group: group
        })
      });
      const data = await searchResults.json();
      const result = data?.results?.query?.PrimaryQueryResult?.RelevantResults?.Table?.Rows?.results
      console.log(result)
  
      let treeItems: ITreeItem[] = [];
  
      if (result && result?.length > 0) {
        treeItems = await Promise.all(
          result.map(async (item) => {
            return parseSearchRow(item)
          })
        );
  
        // Remove null values (folders & items with null FileType)
        treeItems = treeItems.filter(Boolean);
      }
  
      console.log("%cSearch Results:", "color: green; font-weight: bold;", treeItems);
      return treeItems;
    } catch (error) {
      console.error("Error searching library items:", error);
      return [];
    }
  }

  async function handleSearch () {
    setSearchLoading(true)
    const items = await searchLibraryItemsCont(searchText);
    // console.log("****** Search Returns****",items)
    setSearchResults(items)
    setSearchLoading(false)
  };

  // Render file details view
  const renderFileDetails = () => {
    if (!selectedItem || selectedItem.isFolder) return null

    // console.log("Rendering file : ", selectedItem)

    return (
          <DocumentViewer fileUrl={selectedItem.serverRelativeUrl} />
    )
  }

  const updateTreeItemChildren = (treeItems: ITreeItem[], pathSegments: string[], newChildren: ITreeItem[]): ITreeItem[] => {
    // Base case: If pathSegments is empty, no need to search further
    if (pathSegments.length === 0) return treeItems;
  
    const segment = pathSegments[0];  // Get the first path segment
    const remainingSegments = pathSegments.slice(1);  // Remaining segments after the first one
  
    return treeItems.map(item => {
      // If the current item matches the segment, update it
      if (item.name === segment) {
        if (remainingSegments.length === 0) {
          // If we are at the last segment, update the children
          return { ...item, children: newChildren };
        }
  
        // Otherwise, recursively update the children
        return {
          ...item,
          children: updateTreeItemChildren(item.children || [], remainingSegments, newChildren)
        };
      }
  
      // If the current item doesn't match the segment, just return it unchanged
      return item;
    });
  };

  async function onTreeItemExpandCollapse(item: ITreeItem) {

    if (item.isfolder) {
      if (openKeys.has(item.key)) {
        openKeys.delete(item.key); // collapsed
        console.log(item.key + " Collapsed")
      } else {
        openKeys.add(item.key); // expanded
        console.log(item.key + " Expanded")
      }
    }
    console.log(openKeys)
    setOpenKeys(openKeys)
  }

  async function onChangeLoadTreeChildren(item: ITreeItem) {

    onTreeItemExpandCollapse(item)

    if (item.isfolder && !loadedChildren.includes(item.path)) {
      loadedChildren.push(item.path)
      setLoadedChildren(loadedChildren)
      setLoadingMap(prev => ({ ...prev, [item.key]: true }));

      item.children = await buildChildTree(item.path, group);
    
      // console.log(item.children)
      // Push the childen back to treeItems
      const pathSegments = item.path.split("/").filter((p: any) => p).slice(2);
      const updatedTreeItems = updateTreeItemChildren(treeitems, pathSegments, item.children);
      setTreeItems(updatedTreeItems)
      setLoadingMap(prev => ({ ...prev, [item.key]: false }));
    }
  }

  async function handleItemSelect(item: ITreeItem, triggerLoad: boolean): Promise<void> {

    updateBreadcrumbItems(item.path, item.name)
    setSelectedKey(item.key) //Unique
    if(item) {
        if(item.isfolder && triggerLoad) {
          onChangeLoadTreeChildren(item);
        } else {
          const listItem: IDocumentItem = {
          id: item.key,
          fileId: item.fileId.toString(),
          name: item.name,
          isFolder: item.isfolder,
          serverRelativeUrl: item.path
          };
          setSelectedItem(listItem)
        }
    }
  }

  const renderTreeItems = (items: any[]) => {
    return items.map((item) => (
      <TreeItem className={styles.treeViewItem} key={item.key} itemType={item.isfolder? "branch" : "leaf" }
            value={item.path} onClick={() => handleItemSelect(item, false)} open={openKeys.has(item.key)}
            onOpenChange={async (e) => { handleItemSelect(item, true)}}
            style={{  marginLeft: item && item.isfolder? '10px' : '20px'}}
            > 
                <TreeItemLayout>
                  <TooltipHost
                        content={`Plaza Resource Center${item.path.split("Plaza Resource Center")[1] || item.path}`} // Display the adjusted path
                        calloutProps={{
                          directionalHint: DirectionalHint.bottomLeftEdge, // Position the tooltip to the right
                        }}
                      >
                        <div className={`${styles.treeViewItem} ${selectedKey === item.key ? styles.selectedItem : ''}`}>
                        {loadingMap[item.key] && (
                            <Spinner size={SpinnerSize.xSmall} />
                          )}
                          {/* {item.isfolder? <FolderRegular /> : <DocumentRegular />} */}
                          {item.name}

                        </div>
                  </TooltipHost>
                </TreeItemLayout>
              {item.isfolder && (
          <Tree onOpenChange={() => handleItemSelect(item, true)} >{renderTreeItems(item.children)}</Tree>
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
      <Header user={group} onLogout={handleLogout} />
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
              <ResizablePanelGroup direction="horizontal">
              <ResizablePanel
                defaultSize={20}
                minSize={10}
                maxSize={35}
                collapsible={true}
                collapsedSize={4}
                // collapsed={isCollapsed}
                onCollapse={() => setIsCollapsed(true)}
                onExpand={() => setIsCollapsed(false)}
                className="border-r"
              >
              
              <div className={`h-full overflow-y-auto ${isCollapsed ? "hidden" : "block"}`}>
              <Stack className={styles.treeViewContainer}>

                {chatbotVisibility? 
                  <div className={styles.chatbotSearch}>
                    <Chatbot permission={group}/>
                  </div>
                  :
                  undefined
                }
                <TextField className={styles.searchContainer}
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
                             setSearchResults([])
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
                  <Tree aria-label="Dropdown Tree" defaultOpenItems={[process.env.NEXT_PUBLIC_PREURL]} defaultValue={selectedKey ? [selectedKey] : []} 
                    >
                      {!enableSearch ?
                        renderTreeItems(treeitems)
                        :
                        renderTreeItems(searchResults)
                      }
                  </Tree>
                {enableSearch && (!searchResults || !searchResults.length) && <Stack
                verticalAlign="center"
                horizontalAlign="center"
                styles={{ root: { minHeight: 400 } }}
            >
            {searchLoading?
                  <Stack
                  verticalAlign="center"
                  horizontalAlign="center"
                  styles={{ root: { minHeight: 400 } }}
                  >
                  <Spinner size={SpinnerSize.large} label="Loading documents..." />
                  </Stack>:
                    <Stack>
                    No Results
                    </Stack>
              }
            </Stack>
            }
            </Stack>
            </Stack>
          </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>

              {/* Document list or file details */}
             <div className={styles.documentListContainer}>
                <div className={styles.breadcrumbContainer} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {/* <Breadcrumb items={breadcrumbItems} maxDisplayedItems={50} className={styles.breadcrumb} styles={{ list: { flexWrap: 'nowrap' } }} /> */}
                  <CustomBreadcrumb breadcrumbItems={breadcrumbItems} setSelectedItem={setSelectedItem}/>
              </div>

                {/* Content */}
                <div className={styles.contentArea}>
                  {selectedItem && !selectedItem.isFolder
                    ? renderFileDetails()
                    : undefined
                  }
                </div>
              </div>
              </ResizablePanel>
              </ResizablePanelGroup>
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

