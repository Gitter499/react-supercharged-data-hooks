import { useState } from "react";

interface Options {
  arrayHistory?: boolean;
}
type Operation = "push" | "filter" | "remove" | "clear" | "update";

interface History {
  historyArr: Array<any>;
  operation?: Operation;
}

export const useSuperchargedArray = <T>(
  defaultValue: Array<T>,
  options: Options
) => {
  // setup the state
  const [value, setValue] = useState<Array<T>>(defaultValue);

  // if history is set to true, make a normal non-reactive array of the array state when manipulation method is ran
  // history is only used for debugging purposes
  const addHistory = (
    callback: () => void,
    currArrayState: Array<T>,
    op: Operation
  ): void => {
    if (options.arrayHistory === true) {
      const history: Array<History> = [{ historyArr: defaultValue }];
      history.push({ historyArr: currArrayState, operation: op });
      callback();
    } else {
      callback();
    }
  };
  // class for manipulating the value
  class SuperchargedArray {
    push(elem: T): void {
      addHistory(() => setValue((val) => [...val, elem]), value, "push");
    }
    // makes a new copy of the array and updates the value at the specifed index
    update(index: number, newValue: T) {
      addHistory(
        () => {
          const updatedArray = value.slice();
          updatedArray[index] = newValue;

          setValue(updatedArray);
        },
        value,
        "update"
      );
    }
    // copy the array, find the index of the element, and splice it! (or do nothing if it does not exist)
    remove(elem: T): void {
      addHistory(
        () => {
          const updatedArray = value.slice();

          const index = updatedArray.indexOf(elem);

          index > -1 ? updatedArray.splice(index, 1) : null;

          setValue(updatedArray);
        },
        value,
        "remove"
      );
    }
    filter(callback: (value?: T, index?: number, array?: T[]) => void): void {
      addHistory(
        () => setValue((val) => val.filter(callback)),
        value,
        "filter"
      );
    }

    clear(): void {
      addHistory(() => setValue([]), value, "clear");
    }
  }
  if (options.arrayHistory) {
    const array = new SuperchargedArray();
    return [history, array];
  }

  const array = new SuperchargedArray();
  return [value, array];
};
