# Mensajes de animo

Este archivo lo lee la app y el dashboard. Editalo a tu gusto, no hace falta tocar codigo.

## Categorias y cuando se disparan

| Categoria | Cuando se usa | Ejemplo de frase |
|-----------|---------------|------------------|
| `racha`   | Cuando subes tu racha a un multiplo de 5 (5, 10, 15, 30...) | "Llevas {n} dias, no es facil" |
| `animo`   | Cuando marcas un habito sin objetivo o al volver tras fallar | "Venga, tu puedes" |
| `logro`   | Cuando completas un objetivo numerico por primera vez en el dia | "Lo conseguiste! \U0001F389" |
| `fuerte`  | Cuando bates un PR en el gym | "Oye, estas muy fuerte" |
| `campeona`| Cuando completas un objetivo del gym o vuelves tras fallar | "Que campeona" |

## Variables

Dentro de las frases puedes usar:
- `{n}` -> el numero de la racha (solo en categoria `racha`)

## Como editar

1. Abre `mensajes.json` con cualquier editor (Bloc de notas, VSCode...)
2. Cambia las frases, anade o borra las que quieras
3. Guarda
4. Recarga `index.html` en el navegador

## Formato

JSON estandar, comillas dobles, sin comas colgando al final. Si rompes el JSON, la app cae a mensajes por defecto automaticamente (no peta).

```json
{
  "racha": {
    "titulo": "Titulo que se ve en la celebracion",
    "frases": [
      "Frase 1",
      "Frase 2",
      "Frase 3"
    ]
  }
}
```
