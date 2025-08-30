import { FunctionComponent, MouseEventHandler, ReactElement } from "react";

interface ButtonProps {
  children: ReactElement;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const Button: FunctionComponent<ButtonProps> = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>;
};

export { Button };
