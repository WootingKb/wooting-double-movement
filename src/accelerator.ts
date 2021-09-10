import { Key } from "ts-keycode-enum";

export const AcceleratorModifiers = [
  Key.Alt,
  Key.Ctrl,
  Key.Shift,
  Key.LeftWindowKey,
  Key.RightWindowKey,
];

export interface FullAcceleratorDefinition {
  displayName: string;
  value: string;
}

export type AcceleratorDefinition = FullAcceleratorDefinition | string;

export const AcceleratorDefinitions: {
  [key: number]: AcceleratorDefinition;
} = {
  [Key.A]: "A",
  [Key.B]: "B",
  [Key.C]: "C",
  [Key.D]: "D",
  [Key.E]: "E",
  [Key.F]: "F",
  [Key.G]: "G",
  [Key.H]: "H",
  [Key.I]: "I",
  [Key.J]: "J",
  [Key.K]: "K",
  [Key.L]: "L",
  [Key.M]: "M",
  [Key.N]: "N",
  [Key.O]: "O",
  [Key.P]: "P",
  [Key.Q]: "Q",
  [Key.R]: "R",
  [Key.S]: "S",
  [Key.T]: "T",
  [Key.U]: "U",
  [Key.V]: "V",
  [Key.W]: "W",
  [Key.X]: "X",
  [Key.Y]: "Y",
  [Key.Z]: "Z",

  [Key.Zero]: "0",
  [Key.One]: "1",
  [Key.Two]: "2",
  [Key.Three]: "3",
  [Key.Four]: "4",
  [Key.Five]: "5",
  [Key.Six]: "6",
  [Key.Seven]: "7",
  [Key.Eight]: "8",
  [Key.Nine]: "9",

  [Key.Numpad0]: "num0",
  [Key.Numpad1]: "num1",
  [Key.Numpad2]: "num2",
  [Key.Numpad3]: "num3",
  [Key.Numpad4]: "num4",
  [Key.Numpad5]: "num5",
  [Key.Numpad6]: "num6",
  [Key.Numpad7]: "num7",
  [Key.Numpad8]: "num8",
  [Key.Numpad9]: "num9",
  [Key.Multiply]: "nummult",
  [Key.Add]: "numadd",
  [Key.Subtract]: "numsub",
  [Key.DecimalPoint]: "numdec",
  [Key.Divide]: "numdiv",

  [Key.F1]: "F1",
  [Key.F2]: "F2",
  [Key.F3]: "F3",
  [Key.F4]: "F4",
  [Key.F5]: "F5",
  [Key.F6]: "F6",
  [Key.F7]: "F7",
  [Key.F8]: "F8",
  [Key.F9]: "F9",
  [Key.F10]: "F10",
  [Key.F11]: "F11",
  [Key.F12]: "F12",

  [Key.UpArrow]: "Up",
  [Key.DownArrow]: "Down",
  [Key.LeftArrow]: "Left",
  [Key.RightArrow]: "Right",

  [Key.Tilde]: "~",
  [Key.SemiColon]: ";",
  [Key.Quote]: "'",
  [Key.UnderScore]: "-",
  [220]: "\\",
  [Key.ExclamationMark]: "!",
  [Key.AtSign]: "@",
  [Key.Hash]: "#",
  [Key.DollarSign]: "$",
  [Key.PercentSign]: "%",
  [Key.Comma]: ",",
  [Key.Period]: ".",
  [Key.ForwardSlash]: "/",
  [Key.OpenBracket]: "[",
  [Key.ClosedBracket]: "]",

  [Key.PlusSign]: "Plus",
  [Key.Backspace]: "Backspace",
  [Key.Space]: "Space",
  [Key.Delete]: "Delete",
  [Key.Insert]: "Insert",
  [Key.Escape]: "Esc",
  [Key.Enter]: "Enter",
  [Key.Home]: "Home",
  [Key.End]: "End",
  [Key.PageUp]: "PageUp",
  [Key.PageDown]: "PageDown",

  [Key.NumLock]: "NumLock",
  [Key.CapsLock]: "CapsLock",
  [Key.ScrollLock]: "ScrollLock",

  [Key.Alt]: "Alt",
  [Key.Ctrl]: "Ctrl",
  [Key.Shift]: "Shift",
  [Key.LeftWindowKey]: { displayName: "Win", value: "Meta" },
  [Key.RightWindowKey]: { displayName: "Win", value: "Meta" },
};

export function isKeycodeValidForAccelerator(keycode: number): boolean {
  return AcceleratorDefinitions[keycode] !== undefined;
}

export function PrettyAcceleratorName(
  style: "display" | "accelerator",
  keys: Key[]
): string {
  return keys
    .map((k) => {
      const def = AcceleratorDefinitions[k];
      if (typeof def === "string") {
        return def;
      } else {
        switch (style) {
          case "display":
            return def.displayName;
          case "accelerator":
            return def.value;
          default:
            throw new Error(`Unhandled style '${style}'`);
        }
      }
    })
    .join("+");
}
