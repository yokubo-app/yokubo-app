import React from "react";
import { observer } from "mobx-react";
import { StyleSheet, View, ViewStyle, Text } from "react-native";
import { Header, FormInput, FormValidationMessage, Button } from "react-native-elements";
import { Actions } from "react-native-router-flux";
import DatePicker from "react-native-datepicker";

import taskState from "../../state/taskState";

const primaryColor1 = "green";

interface State {
    name: string;
    nameError: string;
    fromDate: string;
    toDate: string;
    metrics: any;
}

interface Props {
    uid: string;
    item: any; // TODO Typing
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#fff",
    } as ViewStyle,
    headerContainer: {
        flex: 1,
        justifyContent: "space-around",
        backgroundColor: "#fff",
    } as ViewStyle,
    formContainer: {
        flex: 2,
        justifyContent: "space-around",
        backgroundColor: "#fff",
    } as ViewStyle,
    inputStyle: {
        color: "black",
        fontSize: 20
    }
});

@observer
export default class Component extends React.Component<Props, State> {

    constructor(props) {
        super(props);

        this.state = {
            name: this.props.item.name,
            nameError: null,
            fromDate: this.props.item.period[0],
            toDate: this.props.item.period[1],
            metrics: this.props.item.metricQuantities
        };
    }

    async patchItem() {

        const mymetrics = this.state.metrics.map(metric => {
            return {
                uid: metric.uid,
                quantity: metric.quantity
            };
        });

        taskState.patchItem(this.props.uid, this.props.item.uid, {
            name: this.state.name,
            period: [this.state.fromDate, this.state.toDate],
            metrics: mymetrics
        });
        Actions.pop();
    }

    parseName(value: any) {
        this.setState({
            name: value
        });
    }

    parseFromDate(value: any) {
        this.setState({
            fromDate: value,
        });
    }
    parseToDate(value: any) {
        this.setState({
            toDate: value
        });
    }

    showNameError() {
        if (this.state.nameError) {
            return <FormValidationMessage>{this.state.nameError}</FormValidationMessage>;
        }
        return null;
    }

    passMetricToState(metricUid, value) {
        const inputMetricEntries = this.state.metrics;
        const metricRes = inputMetricEntries.filter(metric => metric.uid === metricUid)[0];
        metricRes.quantity = value;

        this.setState({
            metrics: inputMetricEntries
        });
    }


    handleOnDeleteItemClick(itemUid) {
        taskState.deleteItem(this.props.uid, itemUid);
        Actions.pop();
    }

    renderMetrices(metrices: any) {
        return (
            <View>
                {metrices.map(metric => {
                    return (
                        <View key={metric.uid}>
                            <Text>Metric is {metric.metric.name}</Text>
                            <Text>Unit is {metric.metric.unit}</Text>
                            <FormInput
                                inputStyle={styles.inputStyle}
                                defaultValue={metric.quantity.toString()}
                                keyboardType="numeric"
                                onChangeText={(e) => this.passMetricToState(metric.uid, e)}
                                underlineColorAndroid={primaryColor1}
                                selectionColor="black" // cursor color
                            />
                        </View>
                    );
                })}
            </View>
        );
    }

    render() {
        return (
            <View style={styles.mainContainer}>

                <View style={styles.headerContainer}>
                    <Header
                        innerContainerStyles={{ flexDirection: "row" }}
                        backgroundColor={primaryColor1}
                        leftComponent={{
                            icon: "arrow-back",
                            color: "#fff",
                            underlayColor: "transparent",
                            onPress: () => { Actions.pop(); }
                        }}
                        rightComponent={{
                            icon: "delete",
                            color: "#fff",
                            underlayColor: "transparent",
                            onPress: () => { this.handleOnDeleteItemClick(this.props.item.uid); }
                        }}
                        centerComponent={{ text: "New Entry", style: { color: "#fff", fontSize: 20 } }}
                        statusBarProps={{ barStyle: "dark-content", translucent: true }}
                        outerContainerStyles={{ borderBottomWidth: 0, height: 75 }}
                    />
                </View>

                <Text>
                    {`Editing item for, ${this.props.uid}`}
                </Text>

                {/* Form input for name */}
                <FormInput
                    inputStyle={styles.inputStyle}
                    defaultValue={this.state.name}
                    onChangeText={(e) => this.parseName(e)}
                    underlineColorAndroid={primaryColor1}
                    selectionColor="black" // cursor color
                />
                {this.showNameError()}

                {/* Form input for date */}
                <DatePicker
                    style={{ width: 300 }}
                    date={this.state.fromDate}
                    mode="datetime"
                    format="YYYY-MM-DD HH:mm"
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    showIcon={false}
                    onDateChange={(date) => {
                        this.parseFromDate(date);
                    }}
                    customStyles={{
                        dateInput: {
                            borderWidth: 0,
                            marginLeft: 16,
                        },
                        dateText: {
                            fontSize: 20,
                            position: "absolute",
                            left: 0,
                            marginLeft: 0
                        },
                        placeholderText: {
                            fontSize: 20,
                            position: "absolute",
                            left: 0,
                            marginLeft: 0
                        }
                    }}
                />
                {/* Line: Because datepicker line is not customizable we draw a line manually */}
                <View
                    style={{
                        borderBottomColor: primaryColor1,
                        marginLeft: 20,
                        marginRight: 20,
                        borderBottomWidth: 1,
                    }}
                />

                {/* Form input for date */}
                <DatePicker
                    style={{ width: 300 }}
                    date={this.state.toDate}
                    mode="datetime"
                    format="YYYY-MM-DD HH:mm"
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    showIcon={false}
                    onDateChange={(date) => {
                        this.parseToDate(date);
                    }}
                    customStyles={{
                        dateInput: {
                            borderWidth: 0,
                            marginLeft: 16,
                        },
                        dateText: {
                            fontSize: 20,
                            position: "absolute",
                            left: 0,
                            marginLeft: 0
                        },
                        placeholderText: {
                            fontSize: 20,
                            position: "absolute",
                            left: 0,
                            marginLeft: 0
                        }
                    }}
                />
                {/* Line: Because datepicker line is not customizable we draw a line manually */}
                <View
                    style={{
                        borderBottomColor: primaryColor1,
                        marginLeft: 20,
                        marginRight: 20,
                        borderBottomWidth: 1,
                    }}
                />

                {this.renderMetrices(this.state.metrics)}

                <View style={styles.formContainer}>
                    <Button
                        raised
                        buttonStyle={{ backgroundColor: primaryColor1, borderRadius: 0 }}
                        textStyle={{ textAlign: "center", fontSize: 18 }}
                        title={"UPDATE"}
                        onPress={() => { this.patchItem(); }}
                    />
                </View>

            </View>
        );
    }

}
