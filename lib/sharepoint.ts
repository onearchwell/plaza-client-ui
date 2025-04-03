import axios from "axios";

/**
 * Generates an access token for SharePoint REST API using client credentials.
 */
async function getSharePointAccessToken(): Promise<string> {
  try {
    const tenantId = process.env.TENANT_ID!;
    const clientId = process.env.CLIENT_ID!;
    const clientSecret = process.env.CLIENT_SECRET!;
    const siteUrl = process.env.SHAREPOINT_URL!;

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
    const siteUrl = process.env.SHAREPOINT_URL!;
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
    console.log("RESPONSE:::::::")
    console.log(response.data.d.results)
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
    const siteUrl = process.env.SHAREPOINT_URL!;

    const response = await axios.get(
      `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderPath}')/Files`,
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
    const siteUrl = process.env.SHAREPOINT_URL!;
    const siteId = process.env.NEXT_PUBLIC_SITE_ID!;

    const response = await axios.get(
      // `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/items/259`,
      `https://plazahomemortgage.sharepoint.com/sites/DocumentManagerDev/_api/Web/Lists(guid'fc30957a-f348-48d7-adf9-32a1fc961241')/Items(180)`,
      // `${siteUrl}/_api/web/GetFileByServerRelativeUrl('${filePath}')/$value`,
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
    console.error("Error fetching file item:", error);
    throw error;
  }
}