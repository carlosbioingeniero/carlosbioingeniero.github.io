[![Quality Gate Status](https://sonar.apps.bancolombia.com/sonarbc/api/project_badges/measure?project=NU0024001_IngSW_Radar&metric=alert_status)](https://sonar.apps.bancolombia.com/sonarbc/dashboard?id=NU0024001_IngSW_Radar)
[![Coverage](https://sonar.apps.bancolombia.com/sonarbc/api/project_badges/measure?project=NU0024001_IngSW_Radar&metric=coverage)](https://sonar.apps.bancolombia.com/sonarbc/dashboard?id=NU0024001_IngSW_Radar)
[![Maintainability Rating](https://sonar.apps.bancolombia.com/sonarbc/api/project_badges/measure?project=NU0024001_IngSW_Radar&metric=sqale_rating)](https://sonar.apps.bancolombia.com/sonarbc/dashboard?id=NU0024001_IngSW_Radar)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![AGPL License](https://badgen.net/github/license/thoughtworks/build-your-own-radar)](https://github.com/thoughtworks/build-your-own-radar)


Una librería que genera un radar interactivo, inspirada en [thoughtworks.com/radar](http://thoughtworks.com/radar).

# Visualizar Radar

Para ver el radar debe ir a [https://radar.apps.bancolombia.com](https://radar.apps.bancolombia.com)

# Como Actualizar Contenido en el Radar

Para realizar esta contribución debe clonar el repositorio y crear una nueva rama a partir de la rama trunk.
```bash
git clone https://grupobancolombia.visualstudio.com/Vicepresidencia%20Servicios%20de%20Tecnolog%C3%ADa/_git/NU0024001_IngSW_Radar
cd NU0024001_IngSW_Radar
git checkout -b feature/performance-tools
```

En esta nueva rama debe realizar la modificación al archivo llamado `radar.csv`, el cual tiene la siguiente estructura:
```csv
name,ring,quadrant,isNew,description  
Composer,adopt,tools,TRUE,"Although the idea of dependency management ..."
```
Este archivo cuenta con 5 columnas o atributos.
- **name**: Nombre de la herramienta, tecnología, etc...
- **ring**: Tipo de recomendación (anillo), puede ser: `adopt`, `assess`, `trial` o `hold`
- **quadrant**: Categoría de la herramienta (cuadrante), puede ser: `tools`, `language-and-frameworks`, `platforms` o `techniques`
- **isNew**: Indicador si la herramienta es nueva o se ha modificado, puede ser: `TRUE` o `FALSE`
- **description**: Descripción de la herramienta, esta descripción puede contener etiquetas `html`

Ejecución en ambiente local:

```bash
npm install
npm run dev
```
Abra en el navegador la siguiente url [http://localhost:8080/](http://localhost:8080/)

Una vez realizados los cambios basta con realizar `commit`, `push` crear un pull request con el cambio hacia `trunk`.

Compartir el link del pull request a alguien del equipo de Ingeniería de Software para su revisión y aprobación. Una vez aprobado se realizaría el despliegue en el ambiente de desarrollo, cuando se haya desplegado en desarrollo deberá verificar que el cambio se vea reflejado y esté correcto, esto lo puede hacer ingresando al ambiente de [desarrollo](https://radar-dev.apps.ambientesbc.com/).

Para el depliegue a producción es necesario tener la DoD asociada, para ello verifique si existe una en el sprint actual o de lo contrario cree una basado en la última, puede encontrarlas en esta [consulta](https://grupobancolombia.visualstudio.com/Vicepresidencia%20Servicios%20de%20Tecnolog%C3%ADa/_queries/query/0af0697c-2c57-4494-ba52-9adbd255ed52/).

Pipelines:
- [**CI/CD**](https://grupobancolombia.visualstudio.com/Vicepresidencia%20Servicios%20de%20Tecnolog%C3%ADa/_build?definitionId=7821)
- [**RM**](https://grupobancolombia.visualstudio.com/Vicepresidencia%20Servicios%20de%20Tecnolog%C3%ADa/_release?definitionId=10832&view=mine&_a=releases)

----

## Contribución diferente al contenido

Todas las tareas están definidas en el `package.json`.

Las solicitudes de contribución son bienvenidas; por favor escriba pruebas siempre que sea posible.
Asegúrate de tener nodejs instalado.

Para realizar esta contribución debe clonar el repositorio y crear una nueva rama a partir de la rama trunk.
```bash
git clone https://grupobancolombia.visualstudio.com/Vicepresidencia%20Servicios%20de%20Tecnolog%C3%ADa/_git/NU0024001_IngSW_Radar
cd NU0024001_IngSW_Radar
git checkout -b feature/some-new-feature-or-fix
```
Instalar dependencias y ejecución de la aplicación

```bash
npm install
npm test
npm run dev
```

Cuando ejecutas `npm run dev` la aplicación estará disponible en [http://localhost:8080/](http://localhost:8080/)

Para ejecutar pruebas E2E en modo headless
- agregar una nueva variable de entorno 'TEST_URL=http://localhost:8080/'
- `npm run end_to_end_test`

Para ejecutar pruebas E2E en modo de depuración
- agregar una nueva variable de entorno 'TEST_URL=http://localhost:8080/'
- `npm run start`
- Click en 'Run all specs' en la ventana de cypress

