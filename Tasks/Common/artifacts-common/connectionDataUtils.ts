import * as tl from 'azure-pipelines-task-lib/task';
import * as protocols from './protocols'
import * as api from './webapi';
import { ConnectOptions } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';
import { ConnectionData } from 'azure-devops-node-api/interfaces/LocationsInterfaces';

/**
 * Gets the raw connection data (direct representation of _apis/connectionData) for the service hosting a particular protocol
 * @param protocolType The packaging protocol, e.g. 'NuGet'
 */
export async function getConnectionDataForProtocol(protocolType: protocols.ProtocolType) : Promise<ConnectionData> {
    // Determine where the Packaging service lives
    tl.debug('Finding the URI packaging service');
    const accessToken = api.getSystemAccessToken();
    const areaId = protocols.getAreaIdForProtocol(protocolType);
    const serviceUri = await getServiceUriFromAreaId(areaId, accessToken); 
    
    // Get _apis/connectionData from the packaging service
    const webApi = api.getWebApiWithProxy(serviceUri, accessToken);
    const locationApi = await webApi.getLocationsApi();
    tl.debug(`Acquiring connection data from ${serviceUri}`);
    const connectionData = await locationApi.getConnectionData(ConnectOptions.IncludeServices);
    tl.debug('Successfully acquired the connection data');

    return connectionData;
}

/**
 * Gets the URI of the service that hosts an area.
 */
async function getServiceUriFromAreaId(areaId: string, accessToken: string): Promise<string> {
    const tfsCollectionUrl = tl.getVariable('System.TeamFoundationCollectionUri');
    const serverType = tl.getVariable('System.ServerType');
    if (!serverType || serverType.toLowerCase() !== 'hosted') {
        return tfsCollectionUrl;
    }

    const webApi = api.getWebApiWithProxy(tfsCollectionUrl, accessToken);
    const locationApi = await webApi.getLocationsApi();

    tl.debug(`Getting URI for area ID ${areaId} from ${tfsCollectionUrl}`);
    try {
        const serviceUriFromArea = await locationApi.getResourceArea(areaId);
        return serviceUriFromArea.locationUrl;
    } catch (error) {
        throw new Error(error);
    }
}