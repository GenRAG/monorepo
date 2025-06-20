def row_to_text(row):
    text = ""
    for key, value in row.items():
        text += f"{key}: {value}\n"
    return text
