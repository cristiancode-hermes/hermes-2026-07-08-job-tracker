import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async findAll(userId: string, search?: string, sort?: string) {
    const where: any = { userId };

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const order: any = {};
    if (sort === 'name') {
      order.name = 'ASC';
    } else if (sort === 'newest') {
      order.createdAt = 'DESC';
    } else if (sort === 'oldest') {
      order.createdAt = 'ASC';
    } else {
      order.createdAt = 'DESC';
    }

    return this.companyRepository.find({
      where,
      order,
      relations: {},
    });
  }

  async findOne(id: string, userId: string) {
    const company = await this.companyRepository.findOne({
      where: { id, userId },
      relations: { applications: true },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async create(userId: string, dto: CreateCompanyDto) {
    const company = this.companyRepository.create({
      ...dto,
      userId,
    });
    return this.companyRepository.save(company);
  }

  async update(id: string, userId: string, dto: UpdateCompanyDto) {
    const company = await this.findOne(id, userId);
    Object.assign(company, dto);
    return this.companyRepository.save(company);
  }

  async remove(id: string, userId: string) {
    const company = await this.findOne(id, userId);
    await this.companyRepository.remove(company);
    return { deleted: true };
  }
}
