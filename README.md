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
        route_short_name: '12',
        stop_lat: 43.6849499423,
        stop_lon: 7.2357431643,
        departure_time: '17:04:00'
    }, ...
]
```
> Ces informations sur toujours supérieur à l'heure actuelle, on ne peut pas obtenir `departure_time: '17:04:00'` si il est 18h

