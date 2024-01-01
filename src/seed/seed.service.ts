import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/pokeResponse.interface';

@Injectable()
export class SeedService {
  
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}
  
  private readonly axios: AxiosInstance= axios;


  async runSeed() {
    await this.pokemonModel.deleteMany({});
    const data  = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10')
    
    const pokemonToInsert: { name: string, no: number }[] = [];

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      pokemonToInsert.push({ name, no })      
    })
     
    await this.pokemonModel.insertMany(pokemonToInsert);
    return 'Seed runned successfully';
  }
   
}
