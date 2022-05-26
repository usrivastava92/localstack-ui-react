export interface ColumnDefinition {
  Header: string,
  accessor: string,
  Cell: ({ value }: { value: any }) => JSX.Element
}

export interface TableData {
  columns: ColumnDefinition[],
  rows: any[]
}