cd practica31testing/backend

INSTALAR DEPENDENCIAS

npm install -D supertest @types/supertest

HACER CORRER TODAS LAS PRUEBAS

npm test -- --runInBand test/practica-3-1

HACE CORRER PRUEBAS INDIVIDUALMENTE

npm test -- --runInBand test/practica-3-1/01-integracion-ascendente.spec.ts
npm test -- --runInBand test/practica-3-1/02-integracion-ad-hoc.spec.ts
npm test -- --runInBand test/practica-3-1/03-integracion-esqueleto.spec.ts
npm test -- --runInBand test/practica-3-1/04-sanidad.spec.ts
npm test -- --runInBand test/practica-3-1/05-humo.spec.ts
npm test -- --runInBand test/practica-3-1/06-regresion.spec.ts
npm test -- --runInBand test/practica-3-1/07-carga.spec.ts
npm test -- --runInBand test/practica-3-1/08-volumen.spec.ts
npm test -- --runInBand test/practica-3-1/09-recuperacion.spec.ts
npm test -- --runInBand test/practica-3-1/10-estres-rendimiento.spec.ts