import { action, observable } from "mobx";
import * as Moment from "moment";
import { DateRange } from "moment-range";

// tslint:disable-next-line:no-implicit-dependencies
import { APIClientStatusCodeError } from "network-stapler";
import APIClient from "../network/APIClient";
import { TaskAPI } from "../network/TaskAPI";

import authStore from "../state/authStore";

export interface IPostTask {
    name: string;
    imageUid: string;
    metrics: IPostMetric[];
}

export interface IPatchTask {
    name?: string;
    imageUid?: string;
    metrics?: {
        uid?: string; // newly added metrics don't have an uid yet
        name: string;
        unit: string;
        action: string;
    }[];
}

export interface IImage {
    uid: string;
    file: string;
    thumbnail: string;
}

export interface IFullTask {
    uid: string;
    name: string;
    createdAt: string;
    image: IImage;
    metrics: IMetric[];
    items: IFullItem[];
    stats: IStats[];
    chartData: IChartData;
    contributionData: IContributionData;
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
    desc: string | null;
    period: string[];
    metrics: string;
}

export interface IPatchItem {
    name?: string;
    desc?: string | null;
    period?: string[];
    metrics?: string;
}

export interface IFullItem {
    uid: string;
    name: string;
    desc: string | null;
    period: string[];
    createdAt: string;
    metricQuantities: {
        uid: string;
        quantity: number;
        createdAt: string;
        metric: {
            uid: string;
            name: string;
            unit: string;
            createdAt: string;
        };
    }[];
    duration: number;
}

export interface IStats {
    metricKey: string;
    metricName: string;
    metricUnit: string;
    totalItems: number;
    totalValue: number;
    averageValue: number;
    minValue: number;
    maxValue: number;
}

export interface IChartData {
    days: {
        date: Moment.Moment;
        dataset: {
            totalValue: number;
            metricKey: string;
            metricName: string;
            metricUnit: string;
        }[];
    }[];
    weeks: {
        daterange: DateRange;
        dataset: {
            totalValue: number;
            metricKey: string;
            metricName: string;
            metricUnit: string;
        }[];
    }[];
    months: {
        daterange: DateRange;
        dataset: {
            totalValue: number;
            metricKey: string;
            metricName: string;
            metricUnit: string;
        }[];
    }[];
}

export interface IContributionData {
    quarters: {
        daterange: DateRange;
        dataset: {
            date: Moment.Moment;
            count: number;
        }[];
    }[];
}

export type TaskError = "Unknown" | "InvalidTimePeriod";

class Tasks {

    @observable tasks: any = observable.map();
    @observable activeTask: any = null;
    @observable error: TaskError = null;
    @observable isLoading: boolean = false;

    @action setActiveTask = (task: any) => {
        this.activeTask = task;
    }

    @action getActiveTask = () => {
        return this.activeTask;
    }

    @action fetchTasks = async () => {
        if (this.isLoading) { return; }
        this.isLoading = true;

        const target = TaskAPI.getTasks(authStore.credentials.accessToken);

        return APIClient.requestType(target)
            .then(response => {
                // Initialize tasks
                this.tasks = response;
                this.error = null;
                this.isLoading = false;
            }).catch(error => {
                this.setError("Unknown");
            });
    }

    @action createTask = async (task: IPostTask) => {
        if (this.isLoading) { return; }
        this.isLoading = true;

        const target = TaskAPI.postTask(authStore.credentials.accessToken, task);

        return APIClient.requestType(target)
            .then(response => {
                // Attach new task to tasks
                this.tasks.push(response);
                this.error = null;
                this.isLoading = false;
            }).catch(error => {
                this.setError("Unknown");
            });
    }

    @action patchTask = async (taskUid: string, task: IPatchTask) => {
        if (this.isLoading) { return; }
        this.isLoading = true;

        const target = TaskAPI.patchTask(authStore.credentials.accessToken, taskUid, task);

        return APIClient.requestType(target)
            .then(response => {
                // Replace old item with patched item
                const foundIndex = this.tasks.findIndex(e => e.uid === response.uid);
                this.tasks[foundIndex] = response;
                this.error = null;
                this.isLoading = false;
            }).catch(error => {
                this.setError("Unknown");
            });
    }

    @action deleteTask = async (taskUid: string) => {
        if (this.isLoading) { return; }
        this.isLoading = true;

        const target = TaskAPI.deleteTask(authStore.credentials.accessToken, taskUid);
        try {
            const response = await APIClient.requestType(target);
            // Delete old task from tasks
            this.tasks = this.tasks.filter(task => task.uid !== response.uid);
            this.error = null;
            this.isLoading = false;
        } catch (error) {
            this.setError("Unknown");
        }
    }

    @action createItem = async (taskUid: string, item: IPostItem) => {
        if (this.isLoading) { return; }
        this.isLoading = true;

        const target = TaskAPI.postItem(authStore.credentials.accessToken, taskUid, item);

        return APIClient.requestType(target)
            .then(response => {
                // Attach new item to task
                this.tasks.forEach(task => {
                    if (task.uid === taskUid) {
                        // Workaround as mobx doest not recognize when array in deeply nested object is extended
                        const localTask = JSON.parse(JSON.stringify(task));
                        localTask.items ? localTask.items.push(response) : localTask.items = [response];
                        task.items = localTask.items;
                    }
                });

                // async fetch task for stats and chartData update
                const taskTarget = TaskAPI.getTask(authStore.credentials.accessToken, taskUid);
                APIClient.requestType(taskTarget)
                    .then(taskResponse => {
                        const task = this.tasks.filter(t => t.uid === taskUid)[0];
                        if (task) {
                            task.stats = taskResponse.stats;
                            task.chartData = taskResponse.chartData;
                            task.contributionData = taskResponse.contributionData;
                        }
                    });

                this.error = null;
                this.isLoading = false;
            }).catch(error => {
                if (error instanceof APIClientStatusCodeError) {
                    if (error.statusCode === 400 && error.response.message === "InvalidTimePeriod") {
                        this.setError("InvalidTimePeriod");
                    } else {
                        this.setError("Unknown");
                    }
                } else {
                    this.setError("Unknown");
                }
            });
    }

    @action patchItem = async (taskUid: string, itemUid: string, item: IPatchItem) => {
        if (this.isLoading) { return; }
        this.isLoading = true;

        const target = TaskAPI.patchItem(authStore.credentials.accessToken, taskUid, itemUid, item);

        return APIClient.requestType(target)
            .then(response => {
                // Replace old item with patched item
                this.tasks.forEach(task => {
                    task.items ? task.items = task.items.map(taskItem => {
                        return taskItem.uid === response.uid ? response : taskItem;
                        // tslint:disable-next-line:no-unused-expression
                    }) : null;
                });

                // async fetch task for stats and chartData update
                const taskTarget = TaskAPI.getTask(authStore.credentials.accessToken, taskUid);
                APIClient.requestType(taskTarget)
                    .then(taskResponse => {
                        const task = this.tasks.filter(t => t.uid === taskUid)[0];
                        if (task) {
                            task.stats = taskResponse.stats;
                            task.chartData = taskResponse.chartData;
                            task.contributionData = taskResponse.contributionData;
                        }
                    });

                this.error = null;
                this.isLoading = false;
            }).catch(error => {
                if (error instanceof APIClientStatusCodeError) {
                    if (error.statusCode === 400 && error.response.message === "InvalidTimePeriod") {
                        this.setError("InvalidTimePeriod");
                    } else {
                        this.setError("Unknown");
                    }
                } else {
                    this.setError("Unknown");
                }
            });
    }

    @action deleteItem = async (taskUid: string, itemUid: string) => {
        if (this.isLoading) { return; }
        this.isLoading = true;

        const target = TaskAPI.deleteItem(authStore.credentials.accessToken, taskUid, itemUid);

        return APIClient.requestType(target)
            .then(item => {
                // Remove item from task
                this.tasks.forEach(task => {
                    // tslint:disable-next-line:no-unused-expression
                    task.items ? task.items = task.items.filter(taskItem => taskItem.uid !== item.uid) : null;
                });

                // async fetch task for stats and chartData update
                const taskTarget = TaskAPI.getTask(authStore.credentials.accessToken, taskUid);
                APIClient.requestType(taskTarget)
                    .then(taskResponse => {
                        const task = this.tasks.filter(t => t.uid === taskUid)[0];
                        if (task) {
                            task.stats = taskResponse.stats;
                            task.chartData = taskResponse.chartData;
                            task.contributionData = taskResponse.contributionData;
                        }
                    });

                this.error = null;
                this.isLoading = false;
            }).catch(error => {
                this.setError("Unknown");
            });
    }

    @action dismissError() {
        this.error = null;
    }

    @action private setError(error: TaskError) {
        this.error = error;
        this.isLoading = false;
    }

}

let tasks: Tasks;
tasks = new Tasks();

// singleton, exposes an instance by default
export default tasks;
