class ProjectMap {
    private original: any;
    private map: any;

    public type: string;
    public label: string;
    public notes: string;

    constructor(source: any) {
        this.original = source;
        this.type = source.type;
        this.label = source.label;
        this.notes = source.notes;
        this.map = {};

        let map = this.map;
        Object.values(source.timelines).forEach(function(timeline, i) {
            let newTimeline: TimelineObject = new TimelineObject(timeline),
                children: Array<string> = [];
            
            Object.values(source.events).forEach(function(event, i) {
                let newEvent: EventObject = new EventObject(event)
                    .setColor(newTimeline.color)
                    .setParentLabel(newTimeline.label);
                
                if(newEvent.isChildOf(newTimeline.label)) children.push(newEvent.label);
            });

            newTimeline.addChildren(children);
            map[newTimeline.label] = newTimeline;
        });

        this.get = this.get.bind(this);
        this.mapTimelines = this.mapTimelines.bind(this);
    }

    get getOriginal() { return this.original }

    get(timelineLabel: string, eventLabel: string) {
        // Search returns project
        if(timelineLabel === undefined) return this;
        
        // Search returns TimelineObject
        if(eventLabel === undefined)
            return this.map[timelineLabel];
        
        // Search returns EventObject
        return new EventObject(this.original.events[eventLabel])
            .setColor(this.map[timelineLabel].color)
            .setParentLabel(timelineLabel);
    }
    
    set(timelineLabel: string, eventLabel: string, value: any = undefined) {
        if(timelineLabel !== undefined)
            this.map[timelineLabel][eventLabel] = value;
    }

    forEachTimeline(fn: any) { Object.values(this.map).forEach(fn); }
    mapTimelines = (fn: any) => Object.values(this.map).map(fn);
    
    getChildEvents(parentTimelineLabel: string): Array<EventObject> {
        const get = this.get;
        return this.map[parentTimelineLabel].children.map((eventLabel: string) => get(parentTimelineLabel, eventLabel));
    }

    /**
     * Returns a sorted array of unique numbers representing the start and end dates of all Timelines
     * @returns {Array<number>} Sorted array of unique numbers representing the start and end dates of all Timelines 
     */
     get allUniqueDates() {
        let datesList: Array<number> = [];
        this.forEachTimeline(function(line: TimelineObject) {
            if(!(line.start in datesList)) datesList.push(line.start);
            if(!(line.end in datesList)) datesList.push(line.end);
        });
        datesList.sort((a, b) => a-b);
        return datesList;
    }

    /**
     * Finds the earliest date, latest date, and total length between all Timelines
     * @returns {object} an object containing earliestDate, latestDate, and totalLength
     */
    get boundsAndLength() {
        let earliestDate: number = -1,
            latestDate: number = -1;
        this.forEachTimeline(function(line: TimelineObject) {
            if(earliestDate === -1) {
                earliestDate = line.start;
                latestDate = line.end;
            }
            else {
                if(line.start < earliestDate) earliestDate = line.start;
                if(line.end > latestDate) latestDate = line.end;
            }
        });

        return {
            earliestDate: earliestDate,
            latestDate: latestDate,
            totalLength: (latestDate-earliestDate),
        }
    }
}

class TimelineObject {
    public label: string;
    public type: string;
    public notes: string;
    public start: number;
    public end: number;
    public color: string;
    
    public children: Array<string>;

    constructor(rawObject: any) {
        this.label = rawObject.label;
        this.type = rawObject.type;
        this.notes = rawObject.notes;
        this.start = rawObject.start;
        this.end = rawObject.end;
        this.color = rawObject.color;
        
        this.children = [];  
    }

    addChild(newChild: string) {
        this.children.push(newChild);
    }
    addChildren(newChildren: Array<string>) {
        this.children.push(...newChildren);
    }
}

class EventObject {
    public label: string;
    public type: string;
    public notes: string;
    public posn: number;
    private timelines: Array<string>;
    
    public parentLabel: string;
    public color: string;

    public children: any;

    constructor(rawObject: any) {
        this.label = rawObject.label;
        this.type = rawObject.type;
        this.notes = rawObject.notes;
        this.posn = rawObject.posn; 
        this.timelines = rawObject.timelines; 

        this.parentLabel = "";
        this.color = "";

        this.children = [];
    }

    setColor(newColor: string): EventObject {
        this.color = newColor;
        return this;
    }
    setParentLabel(newParentLabel: string): EventObject {
        this.parentLabel = newParentLabel;
        return this;
    }
    isChildOf(parentLabel: string) {
        return this.timelines.indexOf(parentLabel) >= 0;
    }
}

export default ProjectMap;