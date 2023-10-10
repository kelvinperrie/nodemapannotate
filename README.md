# mapannotate

The goal is to create a map that can be drawn on (or annotated) and those changes saved. Then at a later date the annotations can be edited/removed/updated. 

Often people take a screenshot of a map, then use a drawing application to mark points of interest on it. That screenshow with drawings on it can then be distributed as needed. 
However, if those points of interest change location then the whole thing needs to be redone from scratch as the annotations are part of the image and cannot be edited.

A use-case is tracking the locations of kiwis and good spots to scan from to try to pick up their transmitter signals. 
A kiwi that has not yet paired up can be constantly on the move and changing it's location. 
This can mean the creation of a lot of maps to track their locations to keep everyone aware of the changes. 
Being able to move and edit the annotations hopefully reduces the work involved in keeping everyone up-to-date with their last known locations.

![Example 1](examples/mapannotate01.gif "Image of UI")

This is deployed at vercel here:

https://mapannotate.vercel.app/map.html?key=test

It would be great if you didn't put cuss words on it.


This is an express app using leaflet.js to do the map stuff, geoman.js to do drawing tools, vercel to host, and a postgres db from neon.



## How to

### Annotating the map

Click the 'Show tools' link so that the toolbar will show. Then select the shape you want to draw. Then click on the map to draw it.

![Example 6](examples/mapannotate06.gif "Image of UI")

![Example 4](examples/mapannotate04.gif "Image of UI")

### Save changes

On the toolbar click the Save icon and select 'Save'. Load will load the annotation data from the database (so you will lose any unsaved changes). Clear will remove all annotations from the map.

![Example 5](examples/mapannotate05.gif "Image of UI")

### Edit or move annotations

Use the 'Edit Layers' or 'Drag Layers' buttons

![Example 7](examples/mapannotate07.gif "Image of UI")

### Add a marker or shape with text

First draw a marker (or shape), then create a text box and snap it to the marker location. If it doesn't snap to the marker location then when you zoom in they might drift apart.

![Example 8](examples/mapannotate08.gif "Image of UI")

### Change layers

![Example 2](examples/mapannotate02.gif "Image of UI")
