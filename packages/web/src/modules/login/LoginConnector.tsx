import * as React from "react";
import { LoginController } from "@tinder/controller";
import { RouteComponentProps } from "react-router-dom";

import { LoginView } from "./ui/LoginView";

export class LoginConnector extends React.PureComponent<
  RouteComponentProps<{}>
> {
  onFinish = () => {
    const {
      history,
      location: { state }
    } = this.props;
    if (state && state.next) {
      return history.push(state.next);
    }

    history.push("/findme");
  };

  render() {
    return (
      <LoginController>
        {({ submit }) => <LoginView onFinish={this.onFinish} submit={submit} />}
      </LoginController>
    );
  }
}
