import React from "react";
import { observer } from "mobx-react";
import { StyleSheet, Text, TextStyle, Image, View, ScrollView, ViewStyle, TouchableOpacity } from "react-native";
import * as _ from "lodash";
import { Header, Icon } from "react-native-elements";
import { Actions } from "react-native-router-flux";

import authStore from "../../state/authStore";
import taskStore from "../../state/taskStore";
import { theme } from "../../shared/styles";

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: theme.backgroundColor,
    } as ViewStyle,
    headerContainer: {
        flex: 1,
        justifyContent: "space-around",
        backgroundColor: theme.backgroundColor
    } as ViewStyle,
    listContainer: {
        flexGrow: 7,
        backgroundColor: theme.backgroundColor,
    } as ViewStyle,
    welcomeScreenContainer: {
        flexGrow: 1,
        backgroundColor: theme.backgroundColor,
        justifyContent: "center",
        alignItems: "center"
    } as ViewStyle,
    formContainer: {
        flex: 2,
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: theme.backgroundColor,
    } as ViewStyle,
    formContainerXElement: {
        flexDirection: "row",
        justifyContent: "center",
        position: "absolute",
        bottom: 10,
        width: "100%"
    },
    formContainerTextElement: {
        fontSize: 20,
        textAlign: "center",
        color: "white",
    } as TextStyle,
    formContainerTouchableElement: {
        margin: 10,
        flex: 1,
    } as TextStyle,
    formContainerImageElement: {
        height: 200,
        // Center child
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    } as TextStyle,
    formContainerEmpty: {
        flex: 1,
        margin: 10,
        height: 200,
    },
    welcomeScreen: {
        flex: 1,
        color: theme.textColor,
        textAlign: "center",
        paddingLeft: 20,
        paddingRight: 20,
        fontSize: 20
    } as TextStyle
});

@observer
export default class Component extends React.Component<null, null> {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        taskStore.fetchTasks();
    }

    handleOnCreateTaskClick() {
        Actions.createTask();
    }

    renderTasks(tasks) {
        let taskIndex = 0;
        const columnCount = 2;
        const rowCount = _.ceil(tasks.length / columnCount);

        const rows = [];
        _.range(rowCount).forEach((rowIndex) => {

            const columns = [];
            _.range(columnCount).forEach((columnIndex) => {

                if (taskIndex < tasks.length) {
                    const task = tasks[taskIndex];
                    columns.push(
                        <TouchableOpacity
                            key={`column${columnIndex}`}
                            onPress={() => {
                                Actions.items({ task });
                            }}
                            onLongPress={() => {
                                Actions.patchTask({ task });
                            }}
                            style={styles.formContainerTouchableElement}
                            activeOpacity={0.8}
                        >
                            <Image
                                key={`image${columnIndex}`}
                                source={{ uri: task.image.thumbnail }}
                                style={styles.formContainerImageElement}
                                // @ts-ignore
                                borderRadius={10}
                            >
                            </Image>
                            <View style={styles.formContainerXElement}>
                                <Text
                                    key={`text${columnIndex}`}
                                    style={styles.formContainerTextElement}
                                >
                                    {task.name}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                } else {
                    columns.push(
                        <Text
                            key={`column${columnIndex}`}
                            style={styles.formContainerEmpty}
                        >
                        </Text>
                    );
                }
                ++taskIndex;
            });
            rows.push(
                <View key={`row${rowIndex}`} style={styles.formContainer}>
                    {columns}
                </View>
            );
        });

        return (
            <ScrollView style={styles.listContainer}>
                {rows}
            </ScrollView>
        );
    }

    renderWelcomeScreen() {
        return (
            <View style={styles.welcomeScreenContainer}>
                <Text style={styles.welcomeScreen}>
                    Hi, {authStore.profile.name}! {"\n"}
                    Click on the + sign on the top right corner to create your first task.
                </Text>
            </View>
        );
    }

    render() {
        const content = taskStore.tasks.length > 0 ? this.renderTasks(taskStore.tasks) : this.renderWelcomeScreen();
        return (
            <View style={styles.mainContainer}>
                <View style={styles.headerContainer}>
                    <Header
                        innerContainerStyles={{ flexDirection: "row" }}
                        backgroundColor={theme.backgroundColor}
                        leftComponent={{
                            icon: "account-circle",
                            color: "#fff",
                            underlayColor: "transparent",
                            onPress: () => { Actions.profile(); }
                        }}
                        centerComponent={{ text: "Tasks", style: { color: "#fff", fontSize: 20, fontWeight: "bold" } }}
                        rightComponent={{
                            icon: "add",
                            color: "#fff",
                            underlayColor: "transparent",
                            onPress: () => { this.handleOnCreateTaskClick(); }
                        }}
                        statusBarProps={{ translucent: true }}
                        outerContainerStyles={{ borderBottomWidth: 2, height: 80, borderBottomColor: "#222222" }}
                    />
                </View>

                {content}
            </View>
        );
    }

}
