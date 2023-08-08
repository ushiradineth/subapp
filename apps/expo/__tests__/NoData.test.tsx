import React from "react";
import { render, screen } from "@testing-library/react-native";
import { TamaguiProvider } from "tamagui";

import NoData from "../src/components/Atoms/NoData";
import config from "../tamagui.config";

describe("NoData", () => {
  it("renders correct children", () => {
    const { getByTestId } = render(
      <TamaguiProvider config={config}>
        <NoData>Testing Children</NoData>
      </TamaguiProvider>,
    );

    expect(getByTestId("nodata")).toBeTruthy();

    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders correct children with backgroup prop", () => {
    const { getByTestId } = render(
      <TamaguiProvider config={config}>
        <NoData background>Testing Children</NoData>
      </TamaguiProvider>,
    );

    expect(getByTestId("nodata-background")).toBeTruthy();

    expect(screen.toJSON()).toMatchSnapshot();
  });
});
