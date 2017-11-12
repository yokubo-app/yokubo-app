import { observable, action } from "mobx";
import { create, persist } from "mobx-persist";
import * as _ from "lodash";

import { TaskAPI } from "../network/TaskAPI";
import APIClient from "../network/APIClient";
import { APIClientStatusCodeError } from "network-stapler";

import * as config from "../config";
import auth from "../state/auth";


export interface IPostTask {
    name: string;
    imageUid: string;
    metrics: Array<IPostMetric>;
}

export interface IPatchTask {
    name?: string;
    imageUid?: string;
}

export interface ITask {
    uid: string;
    name: string;
    createdAt: string;
}

export interface IImage {
    uid: string;
    file: string;
}

export interface IFullTask {
    uid: string;
    name: string;
    createdAt: string;
    image: IImage;
    metrics: Array<IMetric>;
    items: Array<IItem>;
}

export interface IPostMetric {
    name: string;
    unit: string;
}

export interface IPatchMetric {
    name?: string;
    unit?: string;
}

export interface IMetric {
    uid: string;
    name: string;
    unit: string;
    createdAt: string;
}

export interface IPostItem {
    name: string;
    desc: string;
    period: any; // TODO Range;
    metrics: string;
}

export interface IPatchItem {
    name?: string;
    desc?: string;
    period?: any; // TODO Range;
    metrics?: string;
}

export interface IItem {
    uid: string;
    name: string;
    desc: string;
    period: any; // TODO Range;
    metrics: string;
    createdAt: string;
}

export type TaskError = "Unknown";

class Tasks {

    @observable tasks: any = [];
    @observable taskItems: any = []; // Items of active task
    @observable taskMetrics: any = []; // Metrics of active task

    @observable error: TaskError = null;
    @observable isAuthenticated: boolean = false;
    @observable isLoading: boolean = false;
    @observable isRehydrated: boolean = false;

    @action fetchTasks = async () => {

        if (this.isLoading) {
            // bailout, noop
            return;
        }

        this.isLoading = true;
        const target = TaskAPI.getTasks(auth.credentials.accessToken);

        return APIClient.requestType(target)
            .then(tasks => {
                this.tasks = tasks;
                this.error = null;
                this.isAuthenticated = true;
                this.isLoading = false;
            }).catch(error => {
                this.wipe("Unknown");
            });

    }

    @action createTask = async (task: IPostTask) => {

        if (this.isLoading) {
            // bailout, noop
            return;
        }

        this.isLoading = true;
        const target = TaskAPI.postTask(auth.credentials.accessToken, task);

        return APIClient.requestType(target)
            .then(task => {
                // Attach new task to tasks
                this.tasks.push(task);
                this.error = null;
                this.isAuthenticated = true;
                this.isLoading = false;
            }).catch(error => {
                this.wipe("Unknown");
            });

    }

    @action createItem = async (taskUid: string, item: IPostItem) => {

        if (this.isLoading) {
            // bailout, noop
            return;
        }

        this.isLoading = true;
        const target = TaskAPI.postItem(auth.credentials.accessToken, taskUid, item);

        return APIClient.requestType(target)
            .then(item => {
                // Attach new item to items
                // this.tasks.push(item); // TODO
                this.taskItems.push(item);
                this.error = null;
                this.isAuthenticated = true;
                this.isLoading = false;
            }).catch(error => {
                this.wipe("Unknown");
            });

    }

    @action setTaskItems = async (taskUid: string) => {
        const [filteredTask] = this.tasks.filter(task => task.uid === taskUid);
        this.taskItems = filteredTask.items;
        console.log("TASK ITEM SARE: ", JSON.stringify(this.taskItems));
        console.log("SET UP  TASK ITEMS: ", JSON.stringify(this.taskItems));
    }

    @action sortTaskItems = async (taskUid: string, sortKey: string, sortDirection: string) => {
        this.taskItems = _.orderBy(this.taskItems, sortKey, sortDirection);
    }

    @action setTaskMetrics = async (taskUid: string) => {
        const [filteredTask] = this.tasks.filter(task => task.uid === taskUid);
        this.taskMetrics = filteredTask.metrics;
        console.log("SET UP  TASK METRICS: ", JSON.stringify(this.taskMetrics));
    }

    @action dismissError() {
        this.error = null;
    }

    @action signOut() {
        this.wipe(null);
    }

    @action private wipe(error: TaskError) {
        this.error = error;
        this.isAuthenticated = false;
        this.isLoading = false;
    }

}

let tasks: Tasks;

tasks = new Tasks();

// development, make auth available on window object...
(window as any).tasks = tasks;

// singleton, exposes an instance by default
export default tasks;

