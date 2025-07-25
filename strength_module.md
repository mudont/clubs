# Strength Training Module

A separate module like the Tennis module
This one is an attempt to emulate the Strong App.

## Entities of importance

### Exercise
- name
- bodypart (core, arms, back, chest, legs, shoulders, other, olympic, full body)
- category (barbell, dumbbell, machine/other, weighted bodyweight, assisted bodyweight, reps only, cardio, duration)
- image (optional)
- video url (optional)
- doubleWeight? (boolean flag; would be true for dumbbell exercises where we would count 2x wieght)

### WorkoutTemplateSet
- Workout id
- Exercise
- reps


### WorkoutTemplate
- *Name
- *user id
- zero or more WorkoutTemplateSet
- isPublic

### Workout
- *user_id
- *start_date_time
- end_date_time

User story:
Start a workout by choosing a template or an empty template.
