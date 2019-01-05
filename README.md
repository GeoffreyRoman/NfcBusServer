# NfcBusServer

## Initialisation

```shell
npm install
```

## Lancement

```shell
npm run start
```

## Liste des routes

### Obtenir tous le bus passant par un arret

```shell
/bus?stop=12
```

Retourne tous les numeros de bus passant a l'arret mis en parametre

```shell
["62","70","59","98","61","60","08","52"]
```

---

### Obtenir les informations d'un bus

```shell
/informations?bus=12
```

Retourne toutes les informations necessaire sur le numéro du bus passé en parametre

```shell
[
    {
        route_short_name: "12",
        stop_lat: 43.7040523391,
        stop_lon: 7.2617440535,
        departure_time: "13:20:00",
        idTrips: 1315016,
        stop_id: 1446
    },
    ...
]
```

> Ces informations sur toujours supérieur à l'heure actuelle, on ne peut pas obtenir `departure_time: '17:04:00'` si il est 18h

```
Récupèrer le tripsId de l’arrêt le plus proche du marqueur.
Regarder si il y a le tripId sur l’arrêt taggé, si il y est pas,
essayer avec le tripId du bus qui passe après
```

---

### Obtenir les tripsId d'un bus

```shell
/tripsId?bus=12
```

Retourne tous les tripsId (trip == bus physique) par rapport au numero du bus passe en parametre

```shell
[
    1315016,
    1315017,
    1315018,
    1315019,
    1315020,
    1315021,
    ...
]
```

---

### Obtenir tous les arrets de bus

```shell
/stops
```

```shell
[
    {
        idStop: 1,
        stop_name: "Abattoirs",
        stop_lat: 43.7181071846,
        stop_lon: 7.284811704
    },
    ...
]
```
