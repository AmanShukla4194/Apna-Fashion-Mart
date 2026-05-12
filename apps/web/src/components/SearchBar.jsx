
import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const handleSearch = () => {
    onSearch?.({ query, category, priceRange });
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search for products, shops..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="input-premium pl-12"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="rounded-xl">
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mens">Men's Wear</SelectItem>
                  <SelectItem value="womens">Women's Wear</SelectItem>
                  <SelectItem value="kids">Kids Wear</SelectItem>
                  <SelectItem value="ethnic">Ethnic Wear</SelectItem>
                  <SelectItem value="western">Western Wear</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Price Range</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Any price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-500">Under ₹500</SelectItem>
                  <SelectItem value="500-1000">₹500 - ₹1000</SelectItem>
                  <SelectItem value="1000-2000">₹1000 - ₹2000</SelectItem>
                  <SelectItem value="2000+">Above ₹2000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full btn-primary" onClick={handleSearch}>
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button className="btn-primary" onClick={handleSearch}>
        Search
      </Button>
    </div>
  );
};

export default SearchBar;
