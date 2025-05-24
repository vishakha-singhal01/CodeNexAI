export interface CodeSearchResult {
    id: string;
    content: string;
}

export interface CodeDocumentation {
    name: string;
    type: string;
    params?: Parameter[];
    returnType?: string | null;
    comment?: string | null;
    start?: number | null;
    end?: number | null;
    isExported: boolean;
    isDefaultExport: boolean;
    filename?: string;
}

export interface Parameter {
    name: string;
    type: string;
}
