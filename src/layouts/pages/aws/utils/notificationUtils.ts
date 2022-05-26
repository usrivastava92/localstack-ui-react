import { SBProps } from "../../../../components/MDSnackbar";

export const defaultSBProps: SBProps = getInfoSBProps({});

interface SBOverrideProps {
  close?: () => void,
  onClose?: () => void,
  title?: string,
  content?: string,
  open?: boolean,
}

export function getErrorSBProps({ title, content, open, close, onClose }: SBOverrideProps): SBProps {
  return {
    color: "error",
    icon: "warning",
    dateTime: "0 minutes ago",
    close: close ? close : () => {
    },
    onClose: onClose ? onClose : () => {
    },
    title: title ? title : "",
    content: content ? content : "",
    open: open ? open : false
  };
}

export function getInfoSBProps({ title, content, open, close, onClose }: SBOverrideProps): SBProps {
  return {
    color: "primary",
    icon: "notifications",
    dateTime: "0 minutes ago",
    close: close ? close : () => {
    },
    onClose: onClose ? onClose : () => {
    },
    title: title ? title : "",
    content: content ? content : "",
    open: open ? open : false
  };
}

export function getWarningSBProps({ title, content, open, close, onClose }: SBOverrideProps): SBProps {
  return {
    color: "warning",
    icon: "star",
    dateTime: "0 minutes ago",
    close: close ? close : () => {
    },
    onClose: onClose ? onClose : () => {
    },
    title: title ? title : "",
    content: content ? content : "",
    open: open ? open : false
  };
}

export function getSuccessSBProps({ title, content, open, close, onClose }: SBOverrideProps): SBProps {
  return {
    color: "success",
    icon: "check",
    dateTime: "0 minutes ago",
    close: close ? close : () => {
    },
    onClose: onClose ? onClose : () => {
    },
    title: title ? title : "",
    content: content ? content : "",
    open: open ? open : false
  };
}