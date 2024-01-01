import axios, { AxiosInstance } from "axios";
import { HttAdapter } from "../interfaces/httpAdapter.interface";
import { Injectable } from "@nestjs/common";


@Injectable()
export class AxiosAdapter implements HttAdapter {
    private  axios: AxiosInstance= axios
    async get<T>(url: string): Promise<T> {
        try {
          const { data } = await this.axios.get<T>(url);
          return data;   
        }catch (error) {
            throw new Error('This is an error - check server logs');
        }
    }
}

export class httClientFetch implements HttAdapter{    
    async get<T>(url: string): Promise<T> {
        const resp = await fetch(url);
        const data = await resp.json();
        return data;
    }
}