"""
Integração com ViaCEP para consulta de endereços por CEP
"""
import httpx
from typing import Optional, Dict, Any
from fastapi import HTTPException


class ViaCEP:
    """Cliente para API do ViaCEP"""

    BASE_URL = "https://viacep.com.br/ws"

    @staticmethod
    async def buscar_cep(cep: str) -> Dict[str, Any]:
        """
        Busca informações de endereço por CEP

        Args:
            cep: CEP com ou sem formatação

        Returns:
            dict: Dados do endereço

        Raises:
            HTTPException: Se CEP inválido ou não encontrado
        """
        # Remove formatação do CEP
        cep_limpo = ''.join(x for x in cep if x.isdigit())

        # Valida tamanho
        if len(cep_limpo) != 8:
            raise HTTPException(
                status_code=400,
                detail="CEP inválido. Deve conter 8 dígitos."
            )

        url = f"{ViaCEP.BASE_URL}/{cep_limpo}/json/"

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=10.0)

                if response.status_code != 200:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail="Erro ao consultar CEP"
                    )

                data = response.json()

                # ViaCEP retorna {"erro": true} quando CEP não existe
                if data.get("erro"):
                    raise HTTPException(
                        status_code=404,
                        detail="CEP não encontrado"
                    )

                return {
                    "cep": data.get("cep", ""),
                    "logradouro": data.get("logradouro", ""),
                    "complemento": data.get("complemento", ""),
                    "bairro": data.get("bairro", ""),
                    "cidade": data.get("localidade", ""),
                    "estado": data.get("uf", ""),
                    "ibge": data.get("ibge", ""),
                    "gia": data.get("gia", ""),
                    "ddd": data.get("ddd", ""),
                    "siafi": data.get("siafi", ""),
                }

        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail="Timeout ao consultar CEP. Tente novamente."
            )
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao consultar CEP: {str(e)}"
            )


async def buscar_cep(cep: str) -> Dict[str, Any]:
    """
    Função auxiliar para buscar CEP

    Args:
        cep: CEP com ou sem formatação

    Returns:
        dict: Dados do endereço
    """
    return await ViaCEP.buscar_cep(cep)
