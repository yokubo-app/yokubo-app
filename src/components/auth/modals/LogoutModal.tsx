import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FormValidationMessage } from "react-native-elements";
import Modal from "react-native-modal";
import { NavigationScreenProp, NavigationScreenProps } from "react-navigation";

import Button from "../../../shared/components/Button";
import i18n from "../../../shared/i18n";
import { theme } from "../../../shared/styles";
import authStore from "../../../state/authStore";

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: theme.backgroundColor,
        justifyContent: "center",
        alignItems: "stretch",
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 10,
        paddingRight: 10
    }
});

interface IState {
    inputGeneralError: string;
}

interface IProps {
    navigation: NavigationScreenProp<any, any>;
    isVisible: boolean;
    hide(): void;
}

export default class LogoutModal extends React.Component<IProps, IState> {

    static navigationOptions = ({ navigation }: NavigationScreenProps) => {
        return {
            header: null
        };
    }

    // tslint:disable-next-line:member-ordering
    constructor(props: IProps) {
        super(props);
        this.state = {
            inputGeneralError: null
        };
    }

    async signOut() {
        this.props.hide();
        await authStore.signOut();
        this.props.navigation.navigate("Home");
    }

    closeModal() {
        this.setState({
            inputGeneralError: null
        });
        this.props.hide();
    }

    showGeneralError() {
        if (this.state.inputGeneralError) {
            return <FormValidationMessage>{this.state.inputGeneralError}</FormValidationMessage>;
        }

        return null;
    }

    render() {
        return (
            <Modal
                isVisible={this.props.isVisible}
                onBackdropPress={() => this.closeModal()}
                onBackButtonPress={() => this.closeModal()}
            >
                <View style={styles.modalContent}>
                    <Text
                        style={{
                            color: theme.text.primaryColor,
                            fontSize: 18,
                            textAlign: "center",
                            marginBottom: 20
                        }}
                    >
                        {i18n.t("logout.logoutHint")}
                    </Text>

                    <Button
                        title={i18n.t("logout.logoutButton")}
                        onPress={() => { this.signOut(); }}
                    />
                    {this.showGeneralError()}
                </View>
            </Modal>
        );
    }

}
