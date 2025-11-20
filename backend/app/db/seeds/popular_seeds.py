"""
Script para popular Seeds de Parâmetros e Catálogo de Infrações
Execução: python -m app.db.seeds.popular_seeds
"""
import sys
import os

# Adiciona o diretório raiz ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from sqlalchemy.orm import Session
from app.db.base import SessionLocal
from app.models.admin import ParametroSistema
from app.models.fiscal import CatalogoInfracao
from app.db.seeds.parametros_seed import TODOS_PARAMETROS
from app.db.seeds.catalogo_infracoes_seed import CATALOGO_INFRACOES


def popular_parametros(db: Session) -> None:
    """Popula parâmetros do sistema"""
    print("🔧 Populando Parâmetros do Sistema...")

    total = 0
    for param_data in TODOS_PARAMETROS:
        # Verifica se já existe
        existe = db.query(ParametroSistema).filter(
            ParametroSistema.chave == param_data["chave"]
        ).first()

        if not existe:
            parametro = ParametroSistema(**param_data)
            db.add(parametro)
            total += 1
            print(f"  ✅ {param_data['chave']}")
        else:
            print(f"  ⏭️  {param_data['chave']} (já existe)")

    db.commit()
    print(f"\n✅ {total} parâmetros adicionados!\n")


def popular_catalogo_infracoes(db: Session) -> None:
    """Popula catálogo de infrações"""
    print("📋 Populando Catálogo de Infrações...")

    total = 0
    for infracao_data in CATALOGO_INFRACOES:
        # Verifica se já existe
        existe = db.query(CatalogoInfracao).filter(
            CatalogoInfracao.codigo == infracao_data["codigo"]
        ).first()

        if not existe:
            infracao = CatalogoInfracao(**infracao_data)
            db.add(infracao)
            total += 1
            print(f"  ✅ {infracao_data['codigo']} - {infracao_data['descricao'][:50]}...")
        else:
            print(f"  ⏭️  {infracao_data['codigo']} (já existe)")

    db.commit()
    print(f"\n✅ {total} infrações adicionadas!\n")


def main():
    """Função principal"""
    print("\n" + "="*80)
    print("🌱 POPULAR SEEDS - Parâmetros e Catálogo de Infrações")
    print("="*80 + "\n")

    db = SessionLocal()

    try:
        # Popular parâmetros
        popular_parametros(db)

        # Popular catálogo de infrações
        popular_catalogo_infracoes(db)

        print("="*80)
        print("✅ SEEDS POPULADOS COM SUCESSO!")
        print("="*80 + "\n")

    except Exception as e:
        print(f"\n❌ Erro ao popular seeds: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
