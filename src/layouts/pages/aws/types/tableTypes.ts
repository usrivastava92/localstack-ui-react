import { GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { GridRowModel } from '@mui/x-data-grid/models/gridRows';

export interface ColumnDefinition {
  Header: string;
  accessor: string;
  Cell: ({ value }: { value: any }) => JSX.Element;
}

export interface TableData {
  columns: GridEnrichedColDef[];
  rows: GridRowModel<any>[];
}
