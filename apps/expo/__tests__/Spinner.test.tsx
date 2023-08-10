import React from "react";
import { render, screen } from "@testing-library/react-native";
import { TamaguiProvider } from "tamagui";

import { Spinner } from "../src/components/Atoms/Spinner";
import config from "../tamagui.config";

describe("Spinner", () => {
  it("renders correct children", () => {
    const { getByTestId } = render(
      <TamaguiProvider config={config}>
        <Spinner />
      </TamaguiProvider>,
    );

    expect(getByTestId("spinner")).toBeTruthy();

    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders correct children with backgroup prop", () => {
    const { getByTestId } = render(
      <TamaguiProvider config={config}>
        <Spinner background />
      </TamaguiProvider>,
    );

    expect(getByTestId("spinner-background")).toBeTruthy();

    expect(screen.toJSON()).toMatchSnapshot();
  });
});
