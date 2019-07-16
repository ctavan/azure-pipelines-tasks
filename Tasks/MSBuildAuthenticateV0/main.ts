import * as os from 'os';
import * as path from 'path';
import * as tl from 'azure-pipelines-task-lib/task';
import { locateNetFxCredentialProvider, configureCredProvider } from 'artifacts-common/credentialProviderUtils'
import { ProtocolType } from 'artifacts-common/protocols';
import { getPackagingServiceConnections } from 'artifacts-common/serviceConnectionUtils'

// IMPORTANT: This task is nearly identical to the NuGetExeAuthenticate and DotnetAuthenticate tasks.
//            If making a change here, be sure to make the change in those tasks if appropriate.
async function main(): Promise<void> {
    try {
        tl.setResourcePath(path.join(__dirname, 'task.json'));
        tl.setResourcePath(path.join(__dirname, 'node_modules/packaging-common/module.json'));

        // Using this task on non-Windows is unsupported and almost certainly user error
        const isWindows = os.type().match(/^Win/);
        if (!isWindows) {
            throw Error(tl.loc('Error_MSBuildAuthenticateOnlyForWindows'))
        }

        // Configure the credential provider for both same-organization feeds and service connections
        const serviceConnections = getPackagingServiceConnections('nuGetServiceConnections');
        await configureCredProvider(ProtocolType.NuGet, serviceConnections);

        // MSBuild uses the .exe (.NET Framework) variant of artifacts-credprovider
        console.log(tl.loc('ConfiguringMSBuildForCredProvider'));
        const credProviderAssemblyPath = locateNetFxCredentialProvider();
        tl.setVariable("NUGET_PLUGIN_PATHS", credProviderAssemblyPath);
    } catch (error) {
        tl.setResult(tl.TaskResult.Failed, error);
    }
}

main();