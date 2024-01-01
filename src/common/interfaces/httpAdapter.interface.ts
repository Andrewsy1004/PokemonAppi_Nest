export interface HttAdapter{
    get<T>(url: string): Promise<T>;
}