import * as os from 'os';
import * as path from 'path';
import * as tl from 'azure-pipelines-task-lib/task';
import { locateNetCoreCredentialProvider, configureCredProvider } from 'artifacts-common/credentialProviderUtils'
import { ProtocolType } from 'artifacts-common/protocols';
import { getPackagingServiceConnections } from 'artifacts-common/serviceConnectionUtils'

// IMPORTANT: This task is nearly identical to the NuGetExeAuthenticate and MSBuildAuthenticate tasks.
//            If making a change here, be sure to make the change in those tasks if appropriate.
async function main(): Promise<void> {
    try {
        tl.setResourcePath(path.join(__dirname, 'task.json'));
        tl.setResourcePath(path.join(__dirname, 'node_modules/packaging-common/module.json'));

        // Configure the credential provider for both same-organization feeds and service connections
        const serviceConnections = getPackagingServiceConnections('nuGetServiceConnections');
        await configureCredProvider(ProtocolType.NuGet, serviceConnections);

        // dotnet uses the .dll (.NET Core) variant of artifacts-credprovider
        console.log(tl.loc('ConfiguringDotnetForCredProvider'));
        const credProviderAssemblyPath = locateNetCoreCredentialProvider();
        tl.setVariable("NUGET_PLUGIN_PATHS", credProviderAssemblyPath);
    } catch (error) {
        tl.setResult(tl.TaskResult.Failed, error);
    }
}

main();