# Proyecto interdisciplinario
### Segundo cuatrimestre


- Título de la propuesta: LUDOTIME Grupo: 15  División: 5B   

## Integrantes:

- Thiago Liam Enriquez
- Felipe Cogorno
- Ezequiel Ramirez García
- Maximo Bautista Jimenez Lozano


## Descripción de la propuesta

Juego de mesa *“Ludo”*, que consiste en tirar un dado y mover las fichas la cantidad de veces que el jugador decida en torno al resultado del mismo. La finalidad es llegar al objetivo con todas las fichas para ganar la partida. Cada ronda se disputa entre 4 jugadores.
Para alargar las partidas que suelen ser cortas y caóticas, pensamos en que tanto la modalidad en línea como local cuente con varias rondas. El puntaje se define en base a la cantidad de rondas ganadas para el bonificador, y 100 puntos para cada ficha que llegue a la base. Al final de la partida (que consta de hasta 12 rondas según decida el jugador), se hara un recuento de los puntos para definir el ganador.

## Alcance

- Login y register en base de datos: El usuario registrará su cuenta, cuyos datos se almacenan en la base de datos de la página. Si es necesario loguearse nuevamente, el usuario debe ingresar sus credenciales. 

- Multijugador local: Cuatro jugadores pueden jugar por turnos desde la misma máquina, decidiendo el nombre de cada “color” pueden diferenciarse en la tabla de puntaje.

- Varias rondas: Opciones de 1, 3, 6 u 12 rondas para alargar las partidas.

- Tabla de puntajes: Una tabla que llevará los datos sobre las partidas ganadas, los puntos obtenidos y el ganador. 
Se registran 100 puntos por cada pieza tomada, 50 por cada pieza que salga de su base, 150 por cada pieza que llegue a anotar punto y un bonificador según la cantidad de rondas ganadas.

- Modalidad en línea: El jugador podrá jugar en una partida con otros 3 jugadores de manera remota. 

- Modalidad local: El jugador puede asignar un color y nombre para cada jugador que participe, permitiendo partidas de 4 jugadores en una misma máquina.

- Modalidad “time”: A cada jugador se le es dado dos cartas por cada 3 rondas (12 turnos), con la oportunidad de mantenerla hasta el siguiente turno. En caso de utilizarla, se aplicaran efectos que cambiarán el curso de la partida. 

- Modalidad “matemática”: Cada jugador debe resolver ecuaciones matemáticas para tirar el dado, en caso de no poder resolverlas, se saltará su turno. El objetivo es que el jugador resuelva con rapidez cálculos bajo un límite de tiempo que cada vez se hace menor.


## Tareas

1. Creación componentes html: Button.js, Input.js, ¿Fondo.js?, ¿Game.js?
2. Creación componentes clsx: Forms.module.css, Layout.module.css, Fondos.module.css, Game.module.css
3. Hooks
4. Conexión base de datos
5 Creación login y register
6. Pedidos a base de datos
7. Página Home
8. Página modalidades
9. Página tienda
10. Página puntajes
11. Tutorial
12. Modalidad local
13. Lógica puntajes
14. Lógica juego
15. Modalidad en línea
16. Configuración servidor socket.io
17. useSocket
18. Gestión de salas
19. Gestión turnos y estados
20. Testeo

## Responsabilidades
```
   2. 7. 8. 9. 10. Cogorno
   1. 13. 14. 16. 17. Enriquez
   4. 5. 6. 12. 15. Jimenez
   3. 11. 18. 19. 20. Ramirez
```
