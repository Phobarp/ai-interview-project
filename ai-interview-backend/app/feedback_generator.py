def generate_feedback(analysis_results):
    feedback = {}
    
    # Face Direction
    if analysis_results['face_direction'] == "Facing Away":
        feedback["face_direction"] = 0
    else:
        feedback["face_direction"] = 1
    
    # Smile Feedback
    if analysis_results['smile'] == 0:
        feedback["smile"] = 0
    else:
        feedback["smile"] = 1
    
    return feedback
