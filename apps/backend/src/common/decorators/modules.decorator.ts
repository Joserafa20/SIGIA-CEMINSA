import { SetMetadata } from '@nestjs/common';
import { Module } from '@prisma/client';

export const MODULES_KEY = 'modules';
export const Modules = (...modules: Module[]) => SetMetadata(MODULES_KEY, modules);
