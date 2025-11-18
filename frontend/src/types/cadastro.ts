// Types for Cadastro module

export type TipoPessoa = 'F' | 'J'

export interface Endereco {
  id?: string
  tipo_logradouro?: string
  logradouro: string
  numero?: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  pais?: string
  referencia?: string
}

export interface Pessoa {
  id: string
  tipo_pessoa: TipoPessoa
  nome_razao_social: string
  nome_fantasia?: string
  cpf?: string
  cnpj?: string
  rg?: string
  data_nascimento?: string
  email?: string
  telefone?: string
  celular?: string
  ativo: boolean
  observacoes?: string
  endereco?: Endereco
  created_at: string
  updated_at: string
}

export interface PessoaCreate {
  tipo_pessoa: TipoPessoa
  nome_razao_social: string
  nome_fantasia?: string
  cpf?: string
  cnpj?: string
  rg?: string
  data_nascimento?: string
  email?: string
  telefone?: string
  celular?: string
  observacoes?: string
  endereco?: Omit<Endereco, 'id'>
}

export interface PessoaUpdate extends Partial<PessoaCreate> {
  ativo?: boolean
}

export interface TipoImovel {
  id: string
  codigo: string
  descricao: string
  ativo: boolean
}

export interface SetorFiscal {
  id: string
  codigo: string
  nome: string
  valor_m2_terreno?: number
  valor_m2_edificacao?: number
  ativo: boolean
}

export interface Imovel {
  id: string
  inscricao_imobiliaria: string
  tipo_imovel: TipoImovel
  setor_fiscal: SetorFiscal
  proprietario?: Pessoa
  quadra?: string
  lote?: string
  endereco: Endereco
  area_terreno?: number
  area_construida?: number
  area_total?: number
  frente?: number
  fundos?: number
  lado_direito?: number
  lado_esquerdo?: number
  testada_principal?: number
  valor_venal_terreno?: number
  valor_venal_edificacao?: number
  valor_venal_total?: number
  data_cadastro: string
  ativo: boolean
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface ImovelCreate {
  tipo_imovel_id: string
  setor_fiscal_id: string
  proprietario_id?: string
  quadra?: string
  lote?: string
  endereco: Omit<Endereco, 'id'>
  area_terreno?: number
  area_construida?: number
  frente?: number
  fundos?: number
  lado_direito?: number
  lado_esquerdo?: number
  testada_principal?: number
  observacoes?: string
}

export interface ImovelUpdate extends Partial<ImovelCreate> {
  ativo?: boolean
}
