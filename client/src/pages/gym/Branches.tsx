import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Phone,
  Clock,
  User,
  Loader,
} from "lucide-react";
import { branchService } from "../../lib/services";
import { showSuccess, showError } from "../../utils/toast";

interface Branch {
  gymId: string;
  _id: string;
  branchName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactNumber: string;
  openingHours: Record<string, { open: string; close: string }>;
  services: Array<{ name: string; description?: string; price?: number }>;
  photos: Array<{ url: string; caption?: string }>;
  members: string[];
  trainers: string[];
  status: string;
}

interface FormData {
  branchName: string;
  gymId: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactNumber: string;
  openingHours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  services: Array<{ name: string; description: string; price: number }>;
}

const INITIAL_FORM_DATA: FormData = {
  branchName: "",
  gymId: "",
  address: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  },
  contactNumber: "",
  openingHours: {
    monday: { open: "09:00", close: "20:00" },
    tuesday: { open: "09:00", close: "20:00" },
    wednesday: { open: "09:00", close: "20:00" },
    thursday: { open: "09:00", close: "20:00" },
    friday: { open: "09:00", close: "20:00" },
    saturday: { open: "09:00", close: "17:00" },
    sunday: { open: "10:00", close: "15:00" },
  },
  services: [],
};

const Branches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isEdit, setIsEdit] = useState(false);
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [services, setServices] = useState<
    { name: string; description: string; price: number }[]
  >([]);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await branchService.getAllBranches() as {data : Branch[]};
      if (response) {
        setBranches(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching branches:", error);
      showError("Failed to fetch branches");
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEdit(false);
    setFormData(INITIAL_FORM_DATA);
    setModalOpen(true);
  };

  const openEditModal = async (branchId: string) => {
    try {
      setLoading(true);
      const branchData = (await branchService.getBranchById(
        branchId
      )) as Branch;
      setFormData({
        branchName: branchData.branchName,
        gymId: branchData.gymId,
        address: branchData.address,
        contactNumber: branchData.contactNumber,
        openingHours: {
          monday: branchData.openingHours.monday || {
            open: "09:00",
            close: "20:00",
          },
          tuesday: branchData.openingHours.tuesday || {
            open: "09:00",
            close: "20:00",
          },
          wednesday: branchData.openingHours.wednesday || {
            open: "09:00",
            close: "20:00",
          },
          thursday: branchData.openingHours.thursday || {
            open: "09:00",
            close: "20:00",
          },
          friday: branchData.openingHours.friday || {
            open: "09:00",
            close: "20:00",
          },
          saturday: branchData.openingHours.saturday || {
            open: "09:00",
            close: "17:00",
          },
          sunday: branchData.openingHours.sunday || {
            open: "10:00",
            close: "15:00",
          },
        },
        services: (branchData.services || []).map((service) => ({
          name: service.name,
          description: service.description || "",
          price: service.price || 0,
        })),
      });
      setServices(
        (branchData.services || []).map((service) => ({
          name: service.name,
          description: service.description || "",
          price: service.price || 0,
        }))
      );
      setCurrentBranchId(branchId);
      setIsEdit(true);
      setModalOpen(true);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching branch details:", error);
      showError("Failed to load branch details");
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent as keyof FormData]: {
          ...(prev[parent as keyof FormData] as Record<string, any>),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOpeningHoursChange = (
    day: string,
    field: "open" | "close",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day as keyof typeof prev.openingHours]: {
          ...prev.openingHours[day as keyof typeof prev.openingHours],
          [field]: value,
        },
      },
    }));
  };

  const handleServiceChange = (index: number, field: string, value: string) => {
    const updatedServices = [...services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: field === "price" ? parseFloat(value) : value,
    };
    setServices(updatedServices);
  };

  const addService = () => {
    setServices([...services, { name: "", description: "", price: 0 }]);
  };

  const removeService = (index: number) => {
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    setServices(updatedServices);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileInput(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Add services to form data
      const submitData = {
        ...formData,
        services: services,
      };

      if (isEdit && currentBranchId) {
        await branchService.updateBranch(currentBranchId, submitData);
        showSuccess("Branch updated successfully");
      } else {
        await branchService.createBranch(submitData);
        showSuccess("Branch created successfully");
      }

      // Upload photo if selected
      if (fileInput && currentBranchId) {
        const formData = new FormData();
        formData.append("photos", fileInput);
        await branchService.uploadPhoto(currentBranchId, formData);
      }

      setModalOpen(false);
      fetchBranches();
    } catch (error) {
      console.error("Error saving branch:", error);
      showError("Failed to save branch");
      setLoading(false);
    }
  };

  const handleDelete = async (branchId: string) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        setLoading(true);
        await branchService.deleteBranch(branchId);
        showSuccess("Branch deleted successfully");
        fetchBranches();
      } catch (error) {
        console.error("Error deleting branch:", error);
        showError("Failed to delete branch");
        setLoading(false);
      }
    }
  };

  const getAddressString = (address: Branch["address"]) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  const formatOpeningHours = (branch: Branch) => {
    // Format opening hours for display in a readable way
    const days = Object.keys(branch.openingHours);
    if (days.length === 0) return "Not available";

    // Just return a sample for the card
    const monday = branch.openingHours.monday;
    return monday ? `${monday.open} - ${monday.close}` : "Not available";
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Gym Centers</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
        >
          <Plus size={18} />
          Add New Branch
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : branches.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500 mb-4">You don't have any branches yet.</p>
          <button
            onClick={openAddModal}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
          >
            Add Your First Branch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.length !== 0 &&
            branches &&
            branches.map((branch) => (
              <div
                key={branch._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gray-200 relative">
                  {branch.photos && branch.photos.length > 0 ? (
                    <img
                      src={branch.photos[0].url}
                      alt={branch.branchName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white rounded-md px-2 py-1 text-xs font-medium">
                    {branch.status === "active" ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-gray-600">Inactive</span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {branch.branchName}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin
                        size={16}
                        className="mt-1 flex-shrink-0 text-gray-500"
                      />
                      <span className="text-sm text-gray-600">
                        {getAddressString(branch.address)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone
                        size={16}
                        className="flex-shrink-0 text-gray-500"
                      />
                      <span className="text-sm text-gray-600">
                        {branch.contactNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock
                        size={16}
                        className="flex-shrink-0 text-gray-500"
                      />
                      <span className="text-sm text-gray-600">
                        {formatOpeningHours(branch)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User size={16} className="flex-shrink-0 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {branch.members?.length || 0} Members ·{" "}
                        {branch.trainers?.length || 0} Trainers
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/gym/branches/${branch._id}`}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm"
                    >
                      <Eye size={14} />
                      View
                    </Link>

                    <button
                      onClick={() => openEditModal(branch._id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-md text-sm"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(branch._id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-md text-sm"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modal for Add/Edit Branch */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {isEdit ? "Edit Branch" : "Add New Branch"}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch Name *
                    </label>
                    <input
                      type="text"
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number *
                    </label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-2">
                    <h3 className="text-md font-medium mb-2">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <input
                          type="text"
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <h3 className="text-md font-medium mb-2">Opening Hours</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(formData.openingHours).map(
                        ([day, hours]) => (
                          <div key={day} className="flex items-center">
                            <span className="w-24 capitalize">{day}:</span>
                            <input
                              type="time"
                              value={hours.open}
                              onChange={(e) =>
                                handleOpeningHoursChange(
                                  day,
                                  "open",
                                  e.target.value
                                )
                              }
                              className="px-2 py-1 border border-gray-300 rounded-md mr-2"
                            />
                            <span className="mx-1">to</span>
                            <input
                              type="time"
                              value={hours.close}
                              onChange={(e) =>
                                handleOpeningHoursChange(
                                  day,
                                  "close",
                                  e.target.value
                                )
                              }
                              className="px-2 py-1 border border-gray-300 rounded-md"
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <h3 className="text-md font-medium mb-2">
                      Services & Amenities
                      <button
                        type="button"
                        onClick={addService}
                        className="ml-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                      >
                        + Add Service
                      </button>
                    </h3>

                    {services.map((service, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Service Name"
                          value={service.name}
                          onChange={(e) =>
                            handleServiceChange(index, "name", e.target.value)
                          }
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          placeholder="Description"
                          value={service.description}
                          onChange={(e) =>
                            handleServiceChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={service.price}
                          onChange={(e) =>
                            handleServiceChange(index, "price", e.target.value)
                          }
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {isEdit && (
                    <div className="col-span-2">
                      <h3 className="text-md font-medium mb-2">
                        Upload Branch Photo
                      </h3>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader size={18} className="animate-spin mr-2" />
                        Saving...
                      </span>
                    ) : isEdit ? (
                      "Update Branch"
                    ) : (
                      "Create Branch"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
