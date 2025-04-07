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

/**
 * Fetches items from the root of the SharePoint document library.
 */
export async function fetchRootItems() {
  try {
    const accessToken = await getSharePointAccessToken();
    const siteUrl = process.env.NEXT_PUBLIC_SHAREPOINT_URL!;
    const permission = process.env.NEXT_PUBLIC_PERMISSION!;
    const libraryTitle = process.env.NEXT_PUBLIC_DOCUMENT_LIBRARY_NAME!; // Document Library Name

    const response = await axios.get(
      // `${siteUrl}/_api/web/lists/getbytitle('Plaza%20Resource%20Center')/items?$filter=FSObjType eq 0 and Permissions eq '${permission}' and Status eq 'Published'&$select=ID,UniqueId,FileLeafRef,FileRef,Title,Permissions,Status`,
      // `${siteUrl}/_api/web/lists/getbytitle('Plaza%20Resource%20Center')/items?$filter=FSObjType eq 0 and Permissions eq '${permission}'&$select=ID,UniqueId,FileLeafRef,FileRef,Title,Permissions,Status`,
      `${siteUrl}/_api/web/lists/getbytitle('Plaza%20Resource%20Center')/items?$filter=FSObjType eq 0 and OData__ModerationStatus eq 0 and Permissions eq '${permission}'&$select=ID,UniqueId,FileLeafRef,FileRef,Title,Permissions`,

      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json;odata=verbose",
        },
      }
    );
    return response.data.d.results;
  } catch (error) {
    console.error("Error fetching root items:", error);
    throw error;
  }
}

/**
 * Fetches items from a specific folder in the document library.
 * @param folderPath The server-relative path of the folder (e.g., "/sites/siteName/Shared Documents/folderName")
 */
export async function fetchFolderItems(folderPath: string) {
  try {
    const accessToken = await getSharePointAccessToken();
    const siteUrl = process.env.NEXT_PUBLIC_SHAREPOINT_URL!;

    const response = await axios.get(
      `${siteUrl}/_api/web/getFolderByServerRelativePath('${folderPath}')/folders`,
      // `${siteUrl}/_api/web/getFolderByServerRelativePath('${folderPath}')/files`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json;odata=verbose",
        },
      }
    );

    return response.data.d.results;
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
    const accessToken = await getSharePointAccessToken();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
    const url = process.env.NEXT_PUBLIC_SHAREPOINT_URL! + "/_api/search/postquery"
    const query = "path:" + encodeURI(siteUrl.replace(/\/$/, '')) + "/" + queryString + "*"
    console.log(query)

    const body = {
      "request": {
        "__metadata": {
          "type": "Microsoft.Office.Server.Search.REST.SearchRequest"
        },
        // "HitHighlightedProperties": [],
        // "Properties": [],
        // "Querytext": "Plaza* Path:\"https://plazahomemortgage.sharepoint.com/sites/DocumentManagerDev/Plaza%20Resource%20Center/\"",
        "Querytext": queryString,
        // "RefinementFilters": [],
        // "ReorderingRules": [],
        "RowLimit": 50,
        "SelectProperties": ["DocId", "UniqueId", "Title", "Path", "FileType", "SPWebUrl"],
        // "SortList": []
      }
    }

     console.log(body)

    const response = await axios.post(
      url, body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json;odata=verbose",
        },
      }
    );
    console.log(response)
    return response;
  } catch (error) {
    console.error("Error submitting search:", error);
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
    console.log(siteUrl)

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
    console.log(response)
    return response;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
}