import React, {useState, useRef, useEffect} from "react";
import GoogleMapReact from 'google-map-react'
import useSwr from "swr";
import '../App.css'
import useSupercluster from "use-supercluster";
import MarkerLogo from './m1.png'
import logo from '../logo.svg';

const fetcher = (...args) => fetch(...args).then(response => response.json());
const Marker = ({ children }) => children;

export default function ClusterMap(){
    const mapRef = useRef();
    const [bounds, setBounds] = useState(null);
    const [zoom, setZoom] = useState(10);


    const url = "https://data.police.uk/api/crimes-street/all-crime?lat=52.629729&lng=-1.131592&date=2019-10";
    const { data, error } = useSwr(url,{fetcher});
    const crimes = data && !error ? data.slice(0, 40) : [];

    const points = crimes.map(crime => ({
        type: "Feature",
        properties: { cluster: false, crimeId: crime.id, category: crime.category },
        geometry: {
            type: "Point",
            coordinates: [
                parseFloat(crime.location.longitude),
                parseFloat(crime.location.latitude)
            ]
        }
    }));

    const { clusters, supercluster } = useSupercluster({
        points,
        bounds,
        zoom,
        options: { radius: 75, maxZoom: 20 }
    });

    //console.log(clusters);


    return(
        <div style={{height:"100vh",width:"100%",}}>

        <GoogleMapReact
            bootstrapURLKeys={{key:"AIzaSyAIyaDmxj4D1bLQts8Hqv2TzpwiHkw8_mk"}}
            defaultCenter={{ lat: 52.6376, lng: -1.135171 }}
            defaultZoom={10}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({map})=>{
                mapRef.current = map;
            }}
        onChange={({zoom, bounds}) =>{
            setZoom(zoom);
            setBounds([
                bounds.nw.lng,
                bounds.se.lat,
                bounds.se.lng,
                bounds.nw.lat,
            ])
        }}>
            {clusters.map(cluster =>{
                const [longitude, latitude] = cluster.geometry.coordinates;
                const{
                    cluster: isCluster,
                    point_count: pointCount
                }= cluster.properties;

                if(isCluster){
                    return (
                        <Marker
                            key={`cluster-${cluster.id}`}
                            lat={latitude}
                            lng={longitude}>
                            <div
                                className="cluster-marker"
                                style={{
                                    width: `${10 + (pointCount / points.length) * 20}px`,
                                    height: `${10 + (pointCount / points.length) * 20}px`,
                                }}
                                onClick={() => {}}
                            >{pointCount}
                            </div>
                        </Marker>
                    )
                }
                return(
                    <Marker key={`crime-${cluster.properties.crimeId}`}
                            lat={latitude}
                            lng={longitude}>
                        <button className="crime-marker">
                            <img src={MarkerLogo} />
                        </button>
                    </Marker>
                )
            })}

            {/*{crimes.map(crime => (
                <Marker key={crime.id}>
                    <button className="crime-marker">
                        <img src={logo}/>
                    </button>
                </Marker>
            ))}*/}
        </GoogleMapReact>
        </div>
    )
}