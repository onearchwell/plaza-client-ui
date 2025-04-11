import axios from "axios";

/**
 * Generates an access token for SharePoint REST API using client credentials.
 */
async function getSharePointAccessToken(): Promise<string> {
  try {
    const tenantId = process.env.TENANT_ID!;
    const clientId = process.env.CLIENT_ID!;
    const clientSecret = process.env.CLIENT_SECRET!;
    const siteUrl = process.env.NEXT_PUBLIC_SHAREPOINT_URL!;

    const tokenUrl = `https://accounts.accesscontrol.windows.net/${tenantId}/tokens/OAuth/2`;

    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId + '@' + tenantId,
        client_secret: clientSecret,
        resource: "00000003-0000-0ff1-ce00-000000000000/plazahomemortgage.sharepoint.com@" + tenantId
        // scope: `${siteUrl}/.default`,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching SharePoint access token:", error);
    throw error;
  }
}

async function getSharePointAppAccessToken(): Promise<string> {
  try {
    const tenantId = process.env.TENANT_ID!;
    const clientId = process.env.CLIENT_ID!;
    const clientSecret = process.env.CLIENT_SECRET!;
    const siteUrl = process.env.NEXT_PUBLIC_SHAREPOINT_URL!;

    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: `https://plazahomemortgage.sharepoint.com/.default`,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching SharePoint access token:", error);
    throw error;
  }
}

/**
 * Fetches items from the root of the SharePoint document library.
 */
export async function fetchRootItems(currentPath, permission) {
  try {
    const accessToken = await getSharePointAccessToken();
    const siteUrl = process.env.NEXT_PUBLIC_SHAREPOINT_URL!;

    if(!permission)
      permission = "ResCtrUser"
    const libraryTitle = process.env.NEXT_PUBLIC_DOCUMENT_LIBRARY_NAME!; // Document Library Name

    const listTitle = "Plaza Resource Center"
    const url = `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(listTitle)}')/items` +
      // `?$filter=FileDirRef eq '${currentPath}' and Permissions eq '${permission}' and OData__ModerationStatus eq 0 ` +
      `?$filter=FileDirRef eq '${currentPath}' and Permissions eq '${permission}' ` +
      `&$orderby=Priority asc` + 
      `&$select=ID,Title,FileRef,FileLeafRef,FileDirRef,FSObjType,Permissions,UniqueId,Priority,OData__ModerationStatus`;

      console.log(url)

    const response = await axios.get(url,
      // `${siteUrl}/_api/web/lists/getbytitle('Plaza%20Resource%20Center')/items?$filter=FSObjType eq 0 and Permissions eq '${permission}' and Status eq 'Published'&$select=ID,UniqueId,FileLeafRef,FileRef,Title,Permissions,Status`,
      // `${siteUrl}/_api/web/lists/getbytitle('Plaza%20Resource%20Center')/items?$filter=FSObjType eq 0 and Permissions eq '${permission}'&$select=ID,UniqueId,FileLeafRef,FileRef,Title,Permissions,Status`,
      // `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(listTitle)}')/items?$filter=FSObjType eq 0 and OData__ModerationStatus eq 0 and Permissions eq '${permission}'&$select=ID,UniqueId,FileLeafRef,FileRef,Title,Permissions`,

      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json;odata=verbose",
        },
      }
    );
    console.log(response.data.d.results)
    return response.data.d.results;
  } catch (error) {
    console.error("Error fetching root items:", error);
    console.log(error.response)
    throw error;
  }
}

/**
 * Fetches items from a specific folder in the document library.
 * @param folderPath The server-relative path of the folder (e.g., "/sites/siteName/Shared Documents/folderName")
 */
export async function fetchFolderItems(folderPath: string) {
  let result = [];
  try {
    const accessToken = await getSharePointAccessToken();
    const siteUrl = process.env.NEXT_PUBLIC_SHAREPOINT_URL!;
    const response = await axios.get(
      `${siteUrl}/_api/web/getFolderByServerRelativePath(decodedurl='${folderPath}')/folders`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json;odata=verbose",
        },
      }
    );
    result.push(response.data.d.results)
    const response1 = await axios.get(
      `${siteUrl}/_api/web/getFolderByServerRelativePath(decodedurl='${folderPath}')/files`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json;odata=verbose",
        },
      }
    );
    result.push(response1.data.d.results)
    console.log(result)

    return result;
  } catch (error) {
    console.error("Error fetching folder items:", error);
    throw error;
  }
}

/**
 * Fetches items from a specific folder in the document library.
 * @param filePath The server-relative path of the file
 */
export async function fetchFileURL(filePath: string) {
  try {
    const accessToken = await getSharePointAccessToken();
    const siteUrl = process.env.NEXT_PUBLIC_SHAREPOINT_URL!;

    const response = await axios.get(
      `${siteUrl}/_api/web/getfilebyserverrelativeurl('${filePath}')/$value`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );
    return response;
  } catch (error) {
    console.error("Error fetching file item:", error);
    throw error;
  }
}

/**
 * Search Query
 * @param comment
 * @param name
 * @param fileId
 * @param currentPath
 */
export async function searchQuery(queryString: string) {
  try {
    const accessToken = await getSharePointAppAccessToken();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
    const url = process.env.NEXT_PUBLIC_SHAREPOINT_URL! + "/_api/search/postquery"
    const query = "path:" + encodeURI(siteUrl.replace(/\/$/, '')) + "/" + queryString + "*"
    console.log(query)

    const body = {
      "request": {
        // "HitHighlightedProperties": [],
        // "Properties": [],
        // "Querytext": "Plaza* Path:\"https://plazahomemortgage.sharepoint.com/sites/DocumentManagerDev/Plaza%20Resource%20Center/\"",
        "Querytext": queryString,
        // "RefinementFilters": [],
        // "ReorderingRules": [],
        "RowLimit": 50,
        "SelectProperties": {
          "results": ["DocId", "UniqueId", "Title", "Path", "FileType", "SPWebUrl"]
        }
        // "SelectProperties": ["DocId", "UniqueId", "Title", "Path", "FileType", "SPWebUrl"],
        // "SortList": []
      }
    }

     console.log(body)

    const response = await axios.post(
      url, body,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose"
        },
      }
    );
    console.log(response)
    return response;
  } catch (error) {
    console.error("Error submitting search:", error);
    console.log(error.response);
    console.log(error.response.data.error.code)
    console.log(error.response.data.error.message)
    throw error;
  }
}

/**
 * Submit feedback
 * @param comment
 * @param name
 * @param fileId
 * @param currentPath
 */
export async function submitFeedback(comment: string, name: string, fileId: string, currentPath: string) {
  try {
    const accessToken = await getSharePointAccessToken();
    const siteUrl = process.env.NEXT_PUBLIC_SHAREPOINT_URL! + "/_api/web/lists/getByTitle('FeedbackList')/items"

    const response = await axios.post(
      siteUrl,
      {
        FeedbackMessage: comment,
        Name: name,
        FileID: fileId,
        DocumentURL: currentPath
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json;odata=verbose",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
}