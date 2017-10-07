import React from "react";
import { StyleSheet, View, ViewStyle, Text } from "react-native";
import { Header, FormInput, FormValidationMessage, Button } from "react-native-elements";
import { Actions } from "react-native-router-flux";
import Modal from "react-native-modal";

import activities from "../../state/activities";

const primaryColor1 = "green";

interface State {
    inputName: string;
    inputImageUrl: string;
    inputNameError: string;
    inputImageUrlError: string;
    inputMetrics: Array<{
        metricName: string;
        metricUnity: string;
        metricDefaultValue: number;
    }>;
    isInputFieldsModalVisible: boolean;
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        // justifyContent: "space-around",
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
        marginRight: 100,
        color: "black",
        fontSize: 20
    },
    modalInputStyle: {
        color: "black",
        fontSize: 20
    },
    modalContent: {
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "stretch",
        borderRadius: 4,
        borderColor: "rgba(0, 0, 0, 0.1)",
    },
    modalButtonStyle: {
        // flex: 1
    }
});

export default class Component extends React.Component<null, State> {

    tempMetricName: string = "";
    tempMetricUnity: string = "";
    tempMetricDefaultValue: string = "";

    constructor(props) {
        super(props);
        this.state = {
            inputName: "",
            inputImageUrl: "",
            inputNameError: null,
            inputImageUrlError: null,
            inputMetrics: [],
            isInputFieldsModalVisible: false
        };
    }

    async createActivity() {
        activities.createActivity({
            name: this.state.inputName,
            imageUrl: this.state.inputImageUrl,
            inputMetrics: this.state.inputMetrics
        });
        Actions.pop();
    }

    parseName(value: any) {
        this.setState({
            inputName: value
        });
    }

    parseImageUrl(value: any) {
        this.setState({
            inputImageUrl: value
        });
    }

    showNameError() {
        if (this.state.inputNameError) {
            return <FormValidationMessage>{this.state.inputNameError}</FormValidationMessage>;
        }
        return null;
    }

    showImageUrlError() {
        if (this.state.inputImageUrlError) {
            return <FormValidationMessage>{this.state.inputImageUrlError}</FormValidationMessage>;
        }
        return null;
    }

    _showInputFieldsModal = () => this.setState({ isInputFieldsModalVisible: true });

    _hideInputFieldsModal = () => this.setState({ isInputFieldsModalVisible: false });


    parseNewMetricName(value: any) {
        this.tempMetricName = value;
    }

    parseNewMetricUnity(value: any) {
        this.tempMetricUnity = value;
    }

    parseNewMetricDefaultValue(value: any) {
        this.tempMetricDefaultValue = value;
    }

    addMetric() {
        this.setState({
            inputMetrics: this.state.inputMetrics.concat({
                metricName: this.tempMetricName,
                metricUnity: this.tempMetricUnity,
                metricDefaultValue: parseInt(this.tempMetricDefaultValue, 10),
            })
        });
        this._hideInputFieldsModal();
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
                        centerComponent={{ text: "New Activity", style: { color: "#fff", fontSize: 20 } }}
                        statusBarProps={{ barStyle: "dark-content", translucent: true }}
                        outerContainerStyles={{ borderBottomWidth: 0, height: 75 }}
                    />
                </View>

                <FormInput
                    inputStyle={styles.inputStyle}
                    placeholder="Enter activity name"
                    onChangeText={(e) => this.parseName(e)}
                    underlineColorAndroid={primaryColor1}
                    selectionColor="black" // cursor color
                />
                {this.showNameError()}

                <FormInput
                    inputStyle={styles.inputStyle}
                    placeholder="Enter activity image url"
                    onChangeText={(e) => this.parseImageUrl(e)}
                    underlineColorAndroid={primaryColor1}
                    selectionColor="black" // cursor color
                />
                {this.showImageUrlError()}

                <Text>Metrices: {this.state.inputMetrics.map(field => `name: ${field.metricName} - unity: ${field.metricUnity} - defaultValue: ${field.metricDefaultValue} ; `)}</Text>

                <Button
                    raised
                    buttonStyle={{ backgroundColor: primaryColor1, borderRadius: 0 }}
                    textStyle={{ textAlign: "center", fontSize: 18 }}
                    title={"Add Metric"}
                    onPress={this._showInputFieldsModal}
                />

                <Modal
                    isVisible={this.state.isInputFieldsModalVisible}
                    onBackdropPress={this._hideInputFieldsModal}
                    onBackButtonPress={this._hideInputFieldsModal}
                >
                    <View style={styles.modalContent}>
                        <Text>Hello, please enter your new metric</Text>
                        <FormInput
                            inputStyle={styles.modalInputStyle}
                            placeholder="Name"
                            onChangeText={(value) => this.parseNewMetricName(value)}
                            underlineColorAndroid={primaryColor1}
                            selectionColor="black" // cursor color
                        />
                        <FormInput
                            inputStyle={styles.modalInputStyle}
                            placeholder="Unity"
                            onChangeText={(value) => this.parseNewMetricUnity(value)}
                            underlineColorAndroid={primaryColor1}
                            selectionColor="black" // cursor color
                        />
                        <FormInput
                            inputStyle={styles.modalInputStyle}
                            keyboardType="numeric"
                            placeholder="Default Value"
                            onChangeText={(value) => this.parseNewMetricDefaultValue(value)}
                            underlineColorAndroid={primaryColor1}
                            selectionColor="black" // cursor color
                        />
                        <Button
                            inputStyle={styles.modalButtonStyle}
                            raised
                            buttonStyle={{ backgroundColor: primaryColor1, borderRadius: 0 }}
                            textStyle={{ textAlign: "center", fontSize: 18 }}
                            title={"Add metric"}
                            onPress={() => { this.addMetric(); }}
                        />
                    </View>
                </Modal>

                <View style={styles.formContainer}>
                    <Button
                        raised
                        buttonStyle={{ backgroundColor: primaryColor1, borderRadius: 0 }}
                        textStyle={{ textAlign: "center", fontSize: 18 }}
                        title={"CREATE"}
                        onPress={() => { this.createActivity(); }}
                    />
                </View>

            </View>
        );
    }

}
