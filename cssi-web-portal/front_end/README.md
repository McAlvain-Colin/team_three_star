# Team Three Star: Web Portal for the NevWx Edge-to-Edge System
University of Nevada, Reno, Computer Science and Engineering Capstone Project in Software engineering, focusing on Full Stack Web Development

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The CSSI web portal is a web application that allows users to access LoRa device
data. This data can be visualized through the built-in data visualization functionality, or
exported to a file to be analyzed and/or visualized with external tools and methods.
LoRa devices will belong to specific “applications,” which have their own principle
investigators assigned to them. The principle investigators can control data access
permissions to researchers/operators within the application, or grant permission to
users outside of the application. Enthusiast users will have their own application with
full control of their own data and LoRa devices. The goal of this web portal is to act as
a tool for research and a catalyst to the expansion of LoRa technology infrastructure.

## Features

Web Portal Functionality
- User account system
- Multiple account types
- Account permissions
- Reset password via email
- Device management
- Add/remove gateways
- Add/remove sensors
- Change device permissions

Web Portal Functionality Continued
- Data exports
- JSON
- CSV
- Plain text
- Data visualization
- Lists
- Charts/graphs
- Maps

Metrics to Visualize/Export
- Sensor packet readings
- Air temperature
- Soil moisture
- Humidity
- Sensor packet metadata
- Sensor battery life
- Sensor RSSI & SNR
- Calculated values
- Median temperature
- Packet loss
- Sensor health

LoRa 
- MetaData
- - "snr": Signal-to-Noise Ratio, measuring the quality of the signal. 
- - "rssi": Received Signal Strength Indicator, measuring how strong the signal is when received. 
- - "location": Provides the geographical location where the data was received. It includes latitude, longitude, and altitude (in meters). 
- - "source": Indicates how the location information was obtained. "SOURCE_REGISTRY" suggests it's from a registered or predefined source.
- - "timestamp": The Unix timestamp when the data was received, representing the number of seconds since January 1, 1970 (the Unix epoch). 
- - "gateway_ids": Contains identifiers for the gateway that received the message, including an eui (Extended Unique Identifier) and a more human-readable gateway_id.
- - "received_at": The precise time when the data was received by the server, in ISO 8601 format. This provides another timestamp, but with higher precision including the date and time down to the nanosecond.
- - "channel_rssi": This is another indication of the signal strength, similar to "rssi", but specific to the communication channel used. 
- - "uplink_token": A token associated with the uplink message, possibly used for authentication, tracking, or routing the message through the network.

## Usage

- Improve the understanding, prediction, and management of natural disasters such as wildfires, earthquakes, and floods
- Facilitate access to climate data
- Democratize the climate science network in Nevada
- Provide open LoRaWAN infrastructure for the general public

## Contributing

- Colin McAlvain | cmcalvain@nevada.unr.edu
- David Vargas Delgado | TODO
- Huy Tran | TODO

## License

TODO