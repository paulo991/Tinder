import Head from "next/head";
import Link from "next/link";
import * as React from "react";
import styled from "styled-components";
import { MeComponent } from "../generated/apolloComponents";

type Props = {
  title?: string;
};

const Container = styled("div")`
  background-color: #fff;
`;

const Layout: React.FunctionComponent<Props> = ({
  children,
  title = "This is the default title"
}) => (
  <Container>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link
        href="https://fonts.googleapis.com/css?family=Roboto&display=swap"
        rel="stylesheet"
      />
      <style>
        {`
      * { font-family: Roboto ,sans-serif; }
    `}
      </style>
    </Head>
    <header>
      <nav>
        <Link href="/">
          <a>Home</a>
        </Link>{" "}
        |{" "}
        <Link href="/hello">
          <a>hello</a>
        </Link>{" "}
        |{" "}
        <Link href="/FacebookLogin">
          <a>facebooklogin</a>
        </Link>{" "}
        |{" "}
        <Link href="/about">
          <a>about</a>
        </Link>{" "}
        |{" "}
        <MeComponent>
          {({ data, loading }) => {
            if (!data || loading || !data.me) {
              return null;
            }
            {
              console.log(data.me);
            }
            return (
              <Link href="/logout">
                <a>logout</a>
              </Link>
            );
          }}
        </MeComponent>
      </nav>
    </header>
    {children}
    <footer>
      <hr />
      <span>I'm here to stay (Footer)</span>
    </footer>
  </Container>
);

export default Layout;