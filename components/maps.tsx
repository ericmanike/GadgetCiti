"use client";
import React, { useState, useEffect, use } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, OverlayView } from "@react-google-maps/api";
import { getDistance } from "@/lib/distanceFunc";
import { Phone, ChevronDown, ChevronUp, Star } from "lucide-react";
import { greenMapStyle } from "@/lib/mapstyles";
import Spinner from "./loadingComponent";




export default function GetMaps() {

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [overviewIsOpen, setOverviewIsOpen] = useState<boolean>(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [youmarkerOpen, setYouMarkerOpen] = useState<boolean>(false);
  const [selectedDistance, setSelectedDistance] = useState<number>(0); // in km








  useEffect(() => {


    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });

      },
        function (error) {
          console.error("Error Code = " + error.code + " - " + error.message);
        },
        { enableHighAccuracy: true }
      );
      console.log("Geolocation is supported by this browser.");
      console.log('This is the location', location)
    } else {

      alert("Geolocation is not supported by this browser! cannot get location.");
    }

  }, []);

  useEffect(() => {

    if (location) {
      const fetchData = async () => {

        try {
          const response = await fetch(`/api/Maps?lat=${location.latitude}&lng=${location.longitude}`);
          const data = await response.json();
          setData(data.data || []);
          console.log(data.data, 'are the list of places')
          console.log('Location data:', location);

        }
        catch (error) {
          console.error("Error fetching map data:", error);
        }
      };
      fetchData();
      console.log(data)
    }
  }, [location])




  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_URL as string,


  });




  if (!isLoaded) {

    return (

      <Spinner />

    )
  }

  if (!data.length) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <p className="text-gray-700 text-lg font-bold">No nearby recycling centers found. Something went wrong.</p>
      </div>
    )
  }



  return (

    <>



      <div className="w-1fr h-screen bg-gray-300 text-white relative">
        {/* <DistanceFilter/> */}

        <div className={` w-1/2 md:w-[25%] ${overviewIsOpen ? 'h-[450px] transition-all duration-1000 opacity-100' : 'h-18 transition-all duration-1000 opacity-80'}
     border-green-500 z-20 fixed top-2.5 right-0 m-4 px-4 py-5 bg-white text-black 
      rounded-lg shadow-lg overflow-hidden   cursor-pointer`} >

          <h3 className="flex justify-between my-2 h-10" onClick={() => setOverviewIsOpen(!overviewIsOpen)}>
            <span className="flex gap-0.5 font-bold">Overview <Star className="text-yellow-500" />
              <Star className="text-yellow-500" /><Star className="text-yellow-500" /></span>
            <span onClick={() => setOverviewIsOpen(!overviewIsOpen)}>{overviewIsOpen ? <ChevronUp /> : <ChevronDown />}</span></h3>
          <img src={selectedPlace?.icon || data[0]?.icon} alt={selectedPlace?.name} className="w-full h-32 object-cover" />

          <h2 className="text-lg font-bold mt-2">{selectedPlace?.name || data[0]?.name}</h2>
          <p className="text-sm text-gray-600">{selectedPlace?.vicinity || data[0]?.vicinity}</p>
          <p className="text-sm text-gray-600 font-bold">Rating: {selectedPlace?.rating || data[0]?.rating}</p>
          <p className="text-sm text-gray-600">User Ratings: {selectedPlace?.user_ratings_total || data[0]?.user_ratings_total}</p>
          <p className="text-sm text-gray-600 font-bold">Distance: {selectedDistance.toFixed(2)} km</p>
          <a href={`tel:${selectedPlace?.international_phone_number || data[0]?.international_phone_number}`}>
            <p className="text-sm bg-green-500 flex gap-2 cursor-pointer p-2 rounded-md my-2">
              <Phone className="text-white " />
              {selectedPlace?.international_phone_number || data[0]?.international_phone_number}
            </p></a>

        </div>


        {isLoaded && <GoogleMap
          mapContainerStyle={
            { width: '100%', height: '100%', backgroundColor: 'green' }
          }
          center={{
            lat: location?.latitude || 0,
            lng: location?.longitude || 0
          }}
          zoom={13}
          options={{
            styles: greenMapStyle
          }}

        >
          <MarkerF
            position={{
              lat: location?.latitude || 0,
              lng: location?.longitude || 0
            }}
            icon={{
              url: "/marker.svg",
              scaledSize: new window.google.maps.Size(20, 20),
              fillColor: "blue",
              fillOpacity: 1

            }}



            onMouseOver={() => setYouMarkerOpen(true)}
            onMouseOut={() => setYouMarkerOpen(false)}

          />
          {youmarkerOpen && (
            <OverlayView
              position={{
                lat: location?.latitude || 0,
                lng: location?.longitude || 0
              }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div style={{
                borderRadius: '5px',
                backgroundColor: 'blue',
                color: 'white',
                padding: '3px',
                width: 'max-content'
              }}>
                You are here
              </div>
            </OverlayView>
          )}


          {data && data.map((place, index) => (<div key={index}>



            <MarkerF
              position={{
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
              }}

              onMouseOver={() => setHovered(index)}
              onMouseOut={() => setHovered(null)}

              onClick={() => {
                setSelectedPlace(place)

                setOverviewIsOpen(true);
                setSelectedDistance(getDistance(
                  location?.latitude || 0,
                  location?.longitude || 0,
                  place.geometry.location.lat,
                  place.geometry.location.lng
                ));

              }}
            />








            {hovered === index && (
              <OverlayView
                position={{
                  lat: place.geometry.location.lat,
                  lng: place.geometry.location.lng,
                }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div
                  style={{
                    width: "max-content",
                    background: "#2E7D32", // dark green
                    color: "white",
                    padding: "6px 10px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    transform: "translate(-50%, -120%)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    transition: "opacity 0.3s ease",
                    pointerEvents: "none", // ensures the hover doesn't flicker
                  }}
                >
                  {place.name}
                </div>
              </OverlayView>
            )}















          </div>

          ))}



        </GoogleMap>}


      </div>


    </>

  )




}