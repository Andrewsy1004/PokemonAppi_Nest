import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';


@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    }catch (error) {
     this.handleExceptions(error);    
    }
  }

  findAll(paginationDto:PaginationDto) {
    const {limit = 10, offset = 0} = paginationDto;

    return this.pokemonModel.find()
       .limit(limit)
       .skip(offset)
       .sort({no: 1})
       .select('-__v');
  }

  async findOne(termino: string) {
    let pokemon: Pokemon;
    
    if(!isNaN(+termino)) {
      pokemon = await this.pokemonModel.findOne({no: termino});
    }
    
    if(!pokemon && isValidObjectId(termino)) {
      pokemon = await this.pokemonModel.findById(termino);
    }

    if(!pokemon) {
      pokemon = await this.pokemonModel.findOne({name: termino.toLocaleLowerCase().trim()})
    }

    if(!pokemon) throw new NotFoundException(`Pokemon with id, name or no "${termino}" not found`);
    
    return pokemon;
  }

  async update(termino: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(termino);
    if(updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    
    try {    
      await pokemon.updateOne(updatePokemonDto, {new: true});
      return { ...pokemon.toJSON(), ...updatePokemonDto }; 

    }catch (error) {
      this.handleExceptions(error);
    }

  }

  async remove(id: string) {
    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});
    if(deletedCount === 0) throw new BadRequestException(`Pokemon with id ${id} not found`);
    return {"message": "Pokemon deleted"} ; ;
  }
  
  private handleExceptions(error: any) {
    if(error.code === 11000) {
      throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException('Can\'t create Pokemon - Check server logs');
  }

}


