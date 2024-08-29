# _plugins/title_capitalize_hook.rb
Jekyll::Hooks.register [:pages, :documents], :pre_render do |doc|
  exceptions = ['MLK', 'NASA', 'USA'] # Add exceptions here
  if doc.data['title'].is_a?(String)
    doc.data['title'] = doc.data['title'].split.map do |word|
      exceptions.include?(word.upcase) ? word.upcase : word.capitalize
    end.join(' ')
  end
end
