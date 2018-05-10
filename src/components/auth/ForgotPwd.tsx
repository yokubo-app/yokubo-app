import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { Header, Button, FormInput, FormValidationMessage } from "react-native-elements";
import { Actions } from "react-native-router-flux";

import authStore from "../../state/authStore";
import { theme } from "../../shared/styles";

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: "space-around",
        backgroundColor: theme.backgroundColor,
    } as ViewStyle,
    headerContainer: {
        flex: 1,
        justifyContent: "space-around",
        backgroundColor: theme.backgroundColor,
    } as ViewStyle,
    formContainer: {
        flex: 5,
        justifyContent: "flex-start",
        backgroundColor: theme.backgroundColor,
        marginTop: 10
    } as ViewStyle,
    inputStyle: {
        color: theme.inputTextColor,
        fontSize: 20,
        marginBottom: 10
    }
});

interface State {
    inputEmail: string;
    inputEmailError: string;
    inputGeneralError: string;
    emailHint: string;
}
export default class Component extends React.Component<null, State> {

    constructor(props) {
        super(props);
        this.state = {
            inputEmail: "",
            inputEmailError: null,
            inputGeneralError: null,
            emailHint: null
        };
    }

    parseEmail(value: any) {
        this.setState({
            inputEmail: value
        });
    }

    showEmailError() {
        if (this.state.inputEmailError) {
            return <FormValidationMessage>{this.state.inputEmailError}</FormValidationMessage>;
        }
        return null;
    }

    showGeneralError() {
        if (this.state.inputGeneralError) {
            return <FormValidationMessage>{this.state.inputGeneralError}</FormValidationMessage>;
        }
        return null;
    }

    async processForgotPwd() {
        const email = this.state.inputEmail;

        if (email.length < 5) {
            this.setState({
                inputEmailError: "Email must have at least 5 characters",
                inputGeneralError: null
            });
            return;
        }

        await authStore.sendForgottenPwdMail(email);

        if (authStore.error !== null) {
            switch (authStore.error) {
                default:
                    this.setState({
                        inputEmailError: null,
                        inputGeneralError: "An unexpected error happened"
                    });
            }
        } else {
            this.setState({
                inputEmailError: null,
                inputGeneralError: null,
                emailHint: "An email with intructions to reset your password was sent to you. Please check your inbox."
            });
        }
    }

    render() {
        return (
            <View style={styles.mainContainer}>
                <View style={styles.headerContainer}>
                    <Header
                        innerContainerStyles={{ flexDirection: "row" }}
                        backgroundColor={theme.backgroundColor}
                        leftComponent={{
                            icon: "arrow-back",
                            color: "#fff",
                            underlayColor: "transparent",
                            onPress: () => { Actions.pop(); }
                        }}
                        centerComponent={{ text: "Reset Password", style: { color: "#fff", fontSize: 20, fontWeight: "bold" } }}
                        statusBarProps={{ translucent: true }}
                        outerContainerStyles={{ borderBottomWidth: 2, height: 80, borderBottomColor: "#222222" }}
                    />
                </View>
                <View style={styles.formContainer}>
                    <FormInput
                        inputStyle={styles.inputStyle}
                        placeholder="Email"
                        onChangeText={(e) => this.parseEmail(e)}
                        underlineColorAndroid={theme.textColor}
                        selectionColor={theme.inputTextColor} // cursor color
                    />
                    {this.showEmailError()}
                    {this.showGeneralError()}

                    <Button
                        raised
                        buttonStyle={{ backgroundColor: theme.backgroundColor, borderRadius: 0 }}
                        textStyle={{ textAlign: "center", fontSize: 18 }}
                        title={"Reset Password"}
                        onPress={() => { this.processForgotPwd(); }}
                    />

                    <View style={{ flexDirection: "row", padding: 30, justifyContent: "center" }}>
                        {this.state.emailHint &&
                            <Text style={{
                                padding: 5,
                                marginBottom: 5,
                                marginTop: 10,
                                fontSize: 20,
                                color: theme.inputTextColor,
                                textAlign: "center"
                            }}
                            >
                                {this.state.emailHint}
                            </Text>}
                    </View>
                    <View style={{ flexDirection: "row", padding: 30, justifyContent: "center" }}>
                        <Text
                            style={{ padding: 5, fontSize: 20, color: theme.inputTextColor }}
                        >
                            Bring me back to
                        </Text>
                        <Text
                            style={{ padding: 5, fontSize: 20, color: theme.textColor }}
                            onPress={() => { Actions.signIn(); }}
                        >
                            Sign In
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

}