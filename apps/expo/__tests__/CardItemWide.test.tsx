import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { TamaguiProvider } from "tamagui";

import CardItemWide from "../src/components/Atoms/CardItemWide";
import config from "../tamagui.config";

describe("CardItemWide", () => {
  it("can handle onPress", () => {
    const handlePress = jest.fn();

    const { root } = render(
      <TamaguiProvider config={config}>
        <CardItemWide onPress={handlePress} title="Testing Title" image="" />
      </TamaguiProvider>,
    );

    fireEvent.press(root);
    expect(handlePress).toBeCalledTimes(1);

    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("has title", () => {
    const handlePress = jest.fn();

    const { getByText } = render(
      <TamaguiProvider config={config}>
        <CardItemWide onPress={handlePress} title="Testing Title" image="" />
      </TamaguiProvider>,
    );

    expect(getByText("Testing Title")).toBeTruthy();

    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("has text elements", () => {
    const handlePress = jest.fn();

    const { getByText } = render(
      <TamaguiProvider config={config}>
        <CardItemWide
          onPress={handlePress}
          title="Testing Title"
          image=""
          text1="Testing text 1"
          text2="Testing text 2"
          text3="Testing text 3"
        />
      </TamaguiProvider>,
    );

    expect(getByText("Testing text 1")).toBeTruthy();
    expect(getByText("Testing text 2")).toBeTruthy();
    expect(getByText("Testing text 3")).toBeTruthy();

    expect(screen.toJSON()).toMatchSnapshot();
  });
});
