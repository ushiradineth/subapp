import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { TamaguiProvider } from "tamagui";

import ButtonWide from "../src/components/Atoms/ButtonWide";
import config from "../tamagui.config";

describe("ButtonWide", () => {
  it("can handle onPress", () => {
    const handlePress = jest.fn();

    const { getByText } = render(
      <TamaguiProvider config={config}>
        <ButtonWide onPress={handlePress} text="Testing" />
      </TamaguiProvider>,
    );

    const button = getByText("Testing");

    fireEvent.press(button);
    expect(handlePress).toBeCalledTimes(1);
    expect(screen.toJSON()).toMatchSnapshot();
  });
});
