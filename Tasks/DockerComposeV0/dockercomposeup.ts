"use strict";

import * as tl from "azure-pipelines-task-lib/task";
import DockerComposeConnection from "./dockercomposeconnection";
import * as dockerCommandUtils from "docker-common-v2/dockercommandutils";

export function run(connection: DockerComposeConnection): any {
    var command = connection.createComposeCommand();
    command.arg("up");

    var detached = tl.getBoolInput("detached");
    if (detached) {
        command.arg("-d");
    }

    var buildImages = tl.getBoolInput("buildImages");
    if (buildImages) {
        command.arg("--build");
    }

    var abortOnContainerExit = tl.getBoolInput("abortOnContainerExit");
    if (!detached && abortOnContainerExit) {
        command.arg("--abort-on-container-exit");
    }

    command.line(dockerCommandUtils.getCommandArguments(tl.getInput("arguments", false)));
    return connection.execCommand(command);
}
