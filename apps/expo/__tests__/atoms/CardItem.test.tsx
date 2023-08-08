import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { TamaguiProvider } from "tamagui";

import CardItem from "../../src/components/Atoms/CardItem";
import config from "../../tamagui.config";

describe("CardItem", () => {
  it("can handle onPress", () => {
    const handlePress = jest.fn();

    const { root } = render(
      <TamaguiProvider config={config}>
        <CardItem onPress={handlePress} title="Testing Title" image="" />
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
        <CardItem onPress={handlePress} title="Testing Title" image="" />
      </TamaguiProvider>,
    );

    expect(getByText("Testing Title")).toBeTruthy();

    expect(screen.toJSON()).toMatchSnapshot();
  });
});
